require('dotenv').config()

const fs = require('fs')
const path = require('path')

const AccessSettings = require('./lib/AccessSettings')
const ArticleFetcher = require('./lib/ArticleFetcher')
const { generatePdfDocumentation } = require('./lib/helpers/generatePdf')
const { preprocessMarkdown } = require('./lib/helpers/preProcess')
const { generateToC } = require('./lib/helpers/toc')
const { generateCover } = require('./lib/helpers/coverPage')

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 --id [string] --filter [string] --no-coverpage --no-toc')
  .describe('filter', 'filter out articles with prefix')
  .describe('no-coverpage', 'Do not generate cover page')
  .describe('no-toc', 'Do not generate Table of contents')
  .demandOption(['id'])
  .argv

;(async () => {
  const access = new AccessSettings(process.env.YOUTRACK_URL, process.env.YOUTRACK_TOKEN)
  const f = new ArticleFetcher(access)

  fs.rmSync('./output', { recursive: true, force: true })
  fs.mkdirSync('./output')

  let allArticles = await f.allArticles()

  allArticles = allArticles.filter(a => !a.summary.startsWith('TODO'))

  console.log('all articles count:', allArticles.length)

  const root = allArticles.find(a => a.id === argv.id || a.idReadable === argv.id)
  if (!root) {
    console.error('Cannot find root Article', argv.id)
    process.exit(-1)
  }

  await exportArticleTree(root, allArticles, f)
})()

async function exportArticleTree(article, allArticles, f) {
  let stack = recursiveFindChildren(article, allArticles)

  if (argv.filter) {
    stack = stack.filter(a => !a.summary.startsWith(argv.filter))
  }

  // Export each article in the stack to its own PDF file
  for (const a of stack) {
    console.log('downloading article:', a.id, a.summary)
    const fullArticle = await f.byId(a.id)
    fullArticle.level = a.level

    await preprocessMarkdown(fullArticle, f)

    const coverPage = (argv.coverpage === false) ? undefined : generateCover(fullArticle)
    const toc = (argv.toc === false) ? undefined : generateToC([fullArticle])

    const firstPages = [coverPage, toc].filter(p => !!p)
    const outputFileName = path.join('./output', `${fullArticle.idReadable}.pdf`)

    await generatePdfDocumentation([fullArticle], f, firstPages, outputFileName)
  }
}

function recursiveFindChildren(root, allArticles, level = 0) {
  let stack = []
  root.level = level
  stack.push(root)
  const children = filterChildren(root, allArticles)
  for (const c of children) {
    c.level = level + 1
    stack.push(c)
    stack = stack.concat(recursiveFindChildren(c, allArticles, level + 1))
  }
  return stack
}

function filterChildren(current, allArticles) {
  const children = allArticles.filter(a => (a.parentArticle && a.parentArticle.id === current.id))
  children.sort((a, b) => { return a.ordinal - b.ordinal })
  return children
}

