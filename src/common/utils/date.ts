export function transformDateToDatetime(date: string) {
  const dateSplit = date.replaceAll('/', '-').split('-');
  const dateFormatted = `${dateSplit[2]}-${dateSplit[1]}-${dateSplit[0]}`;
  const convertedDate = new Date(`${dateFormatted}T00:00:00Z`);
  return isNaN(convertedDate.getTime()) ? undefined : convertedDate;
}
