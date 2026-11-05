import { convertDate, epochDay, validateDate, type Calendar, type DateParts } from './dates';

export const monthBounds = {
  BS:{min:{year:1975,month:1},max:{year:2099,month:12}},
  AD:{min:{year:1918,month:4},max:{year:2043,month:4}},
} as const;
export type CalendarDay = { day:number; available:boolean; ad?:DateParts; bs?:DateParts; weekday:number };
const monthIndex=(year:number,month:number)=>year*12+month-1;
export function monthInRange(year:number,month:number,calendar:Calendar) {
  const bounds=monthBounds[calendar],value=monthIndex(year,month);
  return Number.isInteger(year)&&Number.isInteger(month)&&month>=1&&month<=12&&value>=monthIndex(bounds.min.year,bounds.min.month)&&value<=monthIndex(bounds.max.year,bounds.max.month);
}
export function calendarMonth(year:number,month:number,calendar:Calendar) {
  if(!monthInRange(year,month,calendar))throw new Error('range');
  let count=calendar==='AD'?new Date(Date.UTC(year,month,0)).getUTCDate():32;
  if(calendar==='BS')while(count>=28){try{validateDate({year,month,day:count},'BS');break;}catch{count--;}}
  const first={year,month,day:1};
  const firstAd=calendar==='AD'?first:convertDate(first,'BS');
  const offset=new Date(epochDay(firstAd)*86400000).getUTCDay();
  const days:CalendarDay[]=Array.from({length:count},(_,i)=>{
    const date={year,month,day:i+1};
    try{
      validateDate(date,calendar);
      const ad=calendar==='AD'?date:convertDate(date,'BS'),bs=calendar==='BS'?date:convertDate(date,'AD');
      return {day:i+1,ad,bs,available:true,weekday:(offset+i)%7};
    }catch{return {day:i+1,available:false,weekday:(offset+i)%7};}
  });
  const cells:(CalendarDay|null)[]=[...Array.from({length:offset},()=>null),...days];
  while(cells.length%7)cells.push(null);
  const previous=month===1?{year:year-1,month:12}:{year,month:month-1};
  const next=month===12?{year:year+1,month:1}:{year,month:month+1};
  return {year,month,calendar,days,cells,previous,next,hasPrevious:monthInRange(previous.year,previous.month,calendar),hasNext:monthInRange(next.year,next.month,calendar)};
}
