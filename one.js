require('dotenv').config()
const fs = require('fs')
const marked = require('marked')
const { JSDOM } = require('jsdom')
const { mdToPdf } = require('md-to-pdf')
const { transliterate } = require('transliteration')

const AccessSettings = require('./lib/AccessSettings')
const ArticleFetcher = require('./lib/ArticleFetcher')
const { generateDocumentation } = require('./lib/helpers/generate')
const { preprocessMarkdown } = require('./lib/helpers/preProcess')

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { generateCover } = require('./lib/helpers/coverPage');
const { generateToC } = require('./lib/helpers/toc');
const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 --id [string] --no-coverpage --no-toc')
  .demandOption(['id'])
  .describe('no-coverpage', 'Do not generate cover page')
  .describe('no-toc', 'Do not generate Table of contents')
  .argv

;(async () => {
  const access = new AccessSettings(process.env.YOUTRACK_URL, process.env.YOUTRACK_TOKEN)
  const f = new ArticleFetcher(access)

  fs.rmSync('./output', { recursive: true, force: true })
  fs.mkdirSync('./output')

  const id = argv.id

  console.log('downloading article:', id)
  const article = await f.byId(id)

  await preprocessMarkdown(article, f)

  console.log(argv)

  const coverPage = (argv.coverpage === false) ? undefined : generateCover(article)
  const toc = (argv.toc === false) ? undefined : generateToC([article])

  if (!article.content) {
    console.log('empty content', (article.idReadable || article.id), article.summary)
    process.exit(-2)
  }

  const firstPages = [coverPage, toc].filter(p => !!p)

  await generateDocumentation([article], f, firstPages)
})()
