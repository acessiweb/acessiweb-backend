export function transformDateToDatetime(date: string) {
  const dateFormatted = date.replaceAll('/', '-');
  const dateSplit = dateFormatted.split('-');
  let dateSystem = '';

  if (dateSplit[2].length === 4 && /^\d+$/.test(dateSplit[2])) {
    dateSystem = `${dateSplit[2]}-${dateSplit[1]}-${dateSplit[0]}`;
  } else {
    dateSystem = dateFormatted;
  }

  const convertedDate = new Date(`${dateSystem}T00:00:00Z`);
  return isNaN(convertedDate.getTime()) ? undefined : convertedDate;
}
