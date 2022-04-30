# gsheet

CLI for google sheets (just like [gdrive](https://github.com/prasmussen/gdrive))

```
$ npm i -g gsheet-cli
```

## Setting up a service account

- 

(per se, one could also do this via a personalized token - just not implemented yet)

## Usage

```
$ gsheet --help
Access a gsheet from the command line
gsheet read|append|update --service-account <file> [--csv] [--format-json]
--sheet <id> [--worksheet <name>] [--firstCol=A] --lastCol=<B or right>
[--lookup-cols <col>[,<col>]] --file <file>|-

Commands:
  gsheet read    Read gsheet and return as JSON (or CSV)
  gsheet append  Apend JSON (or CSV) to gsheet - proprety names = column names
  gsheet update  Update gsheet from JSON (or CSV) - proprety names = column
                 names; needs --lookup-cols to be given

Options:
  --help             Show help                                         [boolean]
  --version          Show version number                               [boolean]
  --service-account  File name of service account file - either path or in
                     ~/.gdrive/ (same as gdrive)             [string] [required]
  --csv              Read output / append/update input is CSV (not JSON)
                                                                       [boolean]
  --format-json      Format the JSON output (JSON only)                [boolean]
  --sheet            ID of the gsheet (last part of URL)     [string] [required]
  --worksheet        Name of the worksheet (defaults to first worksheet)[string]
  --first-col        First column in the worksheet to look at (defaults to A)
                                                                        [string]
  --last-col         Last column in the worksheet to look at (B or right of it)
                                                                        [string]
  --lookup-cols      Name(s) of columns to perform lookup on, need to be defined
                     in JSON (or CSV)                                   [string]
  --file             Read output / append/update input file name; - for stdout /
                     stdin                                   [string] [required]
```

## Examples

### Reading formatted JSON

```
$ gsheet read --service-account some-12345-123456789abc.json --sheet 1aXf_jiHPPu1vbMRlrAYNAI2nTRWEdg1P7HLZXzagKB8 --worksheet Sheet2 --lastCol C --file test.json --format-json
```

### Reading CSV

```
$ gsheet read --service-account some-12345-123456789abc.json --sheet 1aXf_jiHPPu1vbMRlrAYNAI2nTRWEdg1P7HLZXzagKB8 --worksheet Sheet2 --lastCol C --file test.csv --csv
```

### Reading CSV to the command line

```
$ gsheet read --service-account some-12345-123456789abc.json --sheet 1aXf_jiHPPu1vbMRlrAYNAI2nTRWEdg1P7HLZXzagKB8 --worksheet Sheet2 --lastCol C --file - --csv
```

(more examples to come)