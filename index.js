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

async function readInfoImpl(sheets) {
    const result = await sheets.spreadsheets.values.get({
        spreadsheetId: '1aXf_kiHOOu1vbMPlrAYNAI2nTRWEdg1P7HLTXkagKB8',
        range: 'Sheet2!A:C', //'Sheet2!A1:C1001',
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
    return valsJson;
}

async function readInfo(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    const valsJson = await readInfoImpl(sheets);
    console.log(JSON.stringify(valsJson));
    // format CSV
    const valsCsv = await fastcsv.writeToString(valsJson, {headers: true});
    console.log(valsCsv);
}

async function getHeaders(sheets) {
    const headers = await sheets.spreadsheets.values.get({
        spreadsheetId: '1aXf_kiHOOu1vbMPlrAYNAI2nTRWEdg1P7HLTXkagKB8',
        range: 'Sheet2!A1:C1',
        valueRenderOption: 'UNFORMATTED_VALUE',
    });
    return headers.data.values[0];
}

async function appendInfo(auth, rows) {
    const sheets = google.sheets({ version: 'v4', auth });
    const headers = await getHeaders(sheets);
    const result = await sheets.spreadsheets.values.append({
        spreadsheetId: '1aXf_kiHOOu1vbMPlrAYNAI2nTRWEdg1P7HLTXkagKB8',
        range: 'Sheet2!A:C',
        valueInputOption: 'RAW',
        resource: {
            values: rows.map(r => headers.map(h => (undefined === r[h]) ? null: r[h])),
        },
    });
}

async function updateInfo(auth, rows, filterCols) {
    if (filterCols.length < 1) {
        throw new Error('Need at least one filter col');
    }
    const sheets = google.sheets({ version: 'v4', auth });
    const headers = await getHeaders(sheets);
    const currentVals = await readInfoImpl(sheets);
    const updateSpecs = rows.map((r, i) => { // {range, values} or null
        let found = 0; // (0 = not found)
        let existVal = null;
        currentVals.forEach((currentVal, ii) => {
            if (filterCols.filter(h => currentVal[h] === r[h]).length === filterCols.length) {
                found = ii + 2; // (row 2 is first) 
                existVal = currentVal;
            }
        });
        const newRow = {...existVal, ...r};
        if (found >= 1) {
            console.log('Found row ' + found + ' for item #' + i);
            return {
                range: 'Sheet2!A' + found + ':C' + found,
                values: [headers.map(h => (undefined === newRow[h]) ? null: newRow[h])],
            };
        } else {
            console.log('Cannot find row for item #' + i);
            return null;
        }
    }).filter(updateSpec => !!updateSpec);
    if (updateSpecs.length > 0) {
        const result = await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: '1aXf_kiHOOu1vbMPlrAYNAI2nTRWEdg1P7HLTXkagKB8',
            valueInputOption: 'RAW',
            resource: {
                valueInputOption: 'RAW',
                data: updateSpecs,
            }
        });
    }
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
