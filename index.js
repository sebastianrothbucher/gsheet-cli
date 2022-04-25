// https://developers.google.com/sheets/api/guides/values#javascript_4

const fs = require('fs');
const { google } = require('googleapis');
const fastcsv = require('fast-csv');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function authorize() {
    const credentials = JSON.parse(fs.readFileSync('/Users/sebastianrothbucher/Downloads/nifi-331520-d5fdeed35a8d.json', 'utf-8'));
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    return google.auth.getClient({ credentials, scopes: SCOPES });
}

async function readInfo(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    const result = await sheets.spreadsheets.values.get({
        spreadsheetId: '1aXf_kiHOOu1vbMPlrAYNAI2nTRWEdg1P7HLTXkagKB8',
        range: 'Sheet2!A:C',
        valueRenderOption: 'UNFORMATTED_VALUE',
    });
    const vals = result.data.values;
    // format JSON
    const valsJson = vals
        .filter((v, i) => i > 0)
        .map(v => {
            const r = {};
            vals[0].forEach((f, i) => r[f] = v[i]);
            return r;
        });
    console.log(JSON.stringify(valsJson));
    // format CSV
    const valsCsv = await fastcsv.writeToString(valsJson, {headers: true});
    console.log(valsCsv);
}

async function appendInfo(auth, rows) {
    const sheets = google.sheets({ version: 'v4', auth });
    const headers = await sheets.spreadsheets.values.get({
        spreadsheetId: '1aXf_kiHOOu1vbMPlrAYNAI2nTRWEdg1P7HLTXkagKB8',
        range: 'Sheet2!A1:C1',
        valueRenderOption: 'UNFORMATTED_VALUE',
    });
    const result = await sheets.spreadsheets.values.append({
        spreadsheetId: '1aXf_kiHOOu1vbMPlrAYNAI2nTRWEdg1P7HLTXkagKB8',
        range: 'Sheet2!A:C',
        valueInputOption: 'RAW',
        resource: {
            values: rows.map(r => headers.data.values[0].map(h => (undefined === r[h]) ? null: r[h])),
        },
    });
}

async function updateInfo(auth, rows, filterCols) {

}

// now finally do it
async function doIt() {
    const auth = await authorize();
    await readInfo(auth);
    await appendInfo(auth, [{"Name": "Bart", "Email": "bs@ts.com", "Budget": 42}]);
    await updateInfo(auth, [{"Name": "Marge", "Budget": 40}], ['Name']);
}

// TODO: CSV or JSON from file, select lookup columns!!

doIt();
