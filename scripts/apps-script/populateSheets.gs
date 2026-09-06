/**
 * Create entity spreadsheets in a target Drive folder and populate them
 * with mock data copied from a source spreadsheet.
 *
 * Usage:
 * - Open Apps Script project, add this file, set folderId and sourceId below,
 * - Run `createEntitySheetsFromTemplate` and authorize.
 * - The script will create 4 spreadsheets (Sales, Purchase, Cash, Credit) in the folder,
 *   copy the source sheet data into the current month's tab, and set script properties
 *   SHEET_ID_SALES / SHEET_ID_PURCHASE / SHEET_ID_CASH / SHEET_ID_CREDIT.
 */

function createEntitySheetsFromTemplate() {
  const folderId = '1MLTIClEbwDM4g05-uWkrjhH9flal1Rr_' // target folder from user
  const sourceId = '1Q7NTxdeE7xQ7XBNGijn0xjoxkZK4Y1Glu3bMBfmxH-c' // provided mock data

  const folder = DriveApp.getFolderById(folderId)
  const sourceSs = SpreadsheetApp.openById(sourceId)
  const sourceSheet = sourceSs.getSheets()[0]
  const sourceData = sourceSheet.getDataRange().getValues()

  const entities = ['Sales', 'Purchase', 'Cash', 'Credit']
  const props = PropertiesService.getScriptProperties()

  entities.forEach(function (entity) {
    const name = `AI-Hay-Day - ${entity}`
    const ss = SpreadsheetApp.create(name)
    // move file to target folder
    const file = DriveApp.getFileById(ss.getId())
    folder.addFile(file)
    // remove from root folder to keep only in target folder
    DriveApp.getRootFolder().removeFile(file)

    // prepare month tab
    const monthName = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM')
    let sheet = ss.getSheets()[0]
    sheet.setName(monthName)
    sheet.clear()

    // copy source data into the month tab
    if (sourceData && sourceData.length) {
      sheet.getRange(1, 1, sourceData.length, sourceData[0].length).setValues(sourceData)
    }

    // For Purchase we may want additional behavior later; currently it copies the same mock data.

    // Save sheet ID in script properties for Apps Script API to use
    const key = 'SHEET_ID_' + entity.toUpperCase()
    props.setProperty(key, ss.getId())
    Logger.log('Created %s -> %s (month %s)', name, ss.getUrl(), monthName)
  })

  // Create a separate Customers spreadsheet by copying the specific sheet (gid)
  try {
    const customersGid = 1380946947
    const customersName = 'AI-Hay-Day - Customers'
    const customersSs = SpreadsheetApp.create(customersName)
    const customersFile = DriveApp.getFileById(customersSs.getId())
    folder.addFile(customersFile)
    DriveApp.getRootFolder().removeFile(customersFile)

    // find source sheet by gid
    const sourceSheets = sourceSs.getSheets()
    const sourceCustomersSheet = sourceSheets.find(function (s) {
      return s.getSheetId() === customersGid
    })

    if (sourceCustomersSheet) {
      const data = sourceCustomersSheet.getDataRange().getValues()
      const destSheet = customersSs.getSheets()[0]
      destSheet.setName('Customers')
      if (data && data.length) {
        destSheet.getRange(1, 1, data.length, data[0].length).setValues(data)
      }
    } else {
      Logger.log('Warning: source customers sheet with gid %s not found', customersGid)
    }

    // Save property
    props.setProperty('SHEET_ID_CUSTOMERS', customersSs.getId())
    Logger.log('Created %s -> %s', customersName, customersSs.getUrl())
  } catch (err) {
    Logger.log('Error creating Customers sheet: %s', err)
  }
  return { success: true }
}
