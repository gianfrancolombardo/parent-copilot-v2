
import { UI_TEXT } from "../constants";

export function getAgeInMonths(birthDate: Date): number {
  const today = new Date();
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
  months -= birthDate.getMonth();
  months += today.getMonth();
  return months <= 0 ? 0 : months;
}

export function formatAge(birthDate: Date): string {
  const monthsTotal = getAgeInMonths(birthDate);
  const years = Math.floor(monthsTotal / 12);
  const months = monthsTotal % 12;

  if (years > 0) {
    if (months > 0) {
      return UI_TEXT.ageYearsMonths.replace('{years}', String(years)).replace('{months}', String(months));
    }
    return `${years} ${years > 1 ? 'años' : 'año'}`;
  }
  if (months > 0) {
    return UI_TEXT.ageMonths.replace('{months}', String(months));
  }
  return "Recién nacido";
}
