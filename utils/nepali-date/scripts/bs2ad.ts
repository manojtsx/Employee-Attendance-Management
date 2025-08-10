#!/usr/bin/env node
/* eslint-disable no-console */
const NepaliDateClass = require('../NepaliDate').default;

function pad(n: number) {
  if (n < 10) {
    return `0${n}`;
  }
  return `${n}`;
}

function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

try {
  const bs = process.argv[2] ? new NepaliDateClass(process.argv[2]) : new NepaliDateClass();
  console.log(formatDate(bs.getEnglishDate()));
} catch (err) {
  console.log((err as Error).message);
  process.exit(1);
}
