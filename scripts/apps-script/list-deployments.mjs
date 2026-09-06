import fs from 'fs'
import { google } from 'googleapis'

const GAC =
  process.env.GOOGLE_SERVICE_ACCOUNT ||
  (() => {
    try {
      return fs.readFileSync('./gac.json', 'utf8')
    } catch {
      return null
    }
  })()
const SCRIPT_ID = process.env.APPS_SCRIPT_ID || null

if (!GAC) {
  console.error('Provide service account JSON in GOOGLE_SERVICE_ACCOUNT env or ./gac.json')
  process.exit(1)
}
if (!SCRIPT_ID) {
  console.error('Provide APPS_SCRIPT_ID env var')
  process.exit(1)
}

async function listDeployments() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(GAC),
    scopes: [
      'https://www.googleapis.com/auth/script.deployments',
      'https://www.googleapis.com/auth/script.projects',
    ],
  })
  const client = await auth.getClient()
  const script = google.script({ version: 'v1', auth: client })

  const res = await script.projects.deployments.list({ scriptId: SCRIPT_ID })
  const deployments = res.data.deployments || []
  if (!deployments.length) {
    console.log('No deployments found for script:', SCRIPT_ID)
    return
  }

  console.log(`Deployments for script ${SCRIPT_ID}:`)
  for (const d of deployments) {
    console.log('---')
    console.log('deploymentId:', d.deploymentId)
    console.log('createTime:', d.createTime)
    if (d.deploymentConfig && d.deploymentConfig.entryPoints) {
      for (const ep of d.deploymentConfig.entryPoints) {
        console.log('entryPoint type:', ep.entryPointType)
        if (ep.webApp) {
          console.log('webApp url:', ep.webApp.url)
          console.log('webApp executeAs:', ep.webApp.executeAs)
          console.log('webApp access:', ep.webApp.access)
        }
      }
    }
  }
}

listDeployments().catch((err) => {
  console.error(err)
  process.exit(1)
})
