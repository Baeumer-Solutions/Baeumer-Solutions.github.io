/* Neutral workbench arithmetic from Protect-12 design-v1. No customer data. */
(function(){
const finitePositive=v=>Number.isFinite(Number(v))&&Number(v)>=0?Number(v):0;
const known=v=>v!==''&&v!=null&&Number.isFinite(Number(v))&&Number(v)>=0;
function foodTotals(rows,people,kcalPerPerson,days,site='Zuhause'){
 const chosen=rows.filter(r=>r.site===site&&!r.archived), keys=['kcal','protein','fat','carbs','fiber','salt'];
 const sums=Object.fromEntries(keys.map(k=>[k,0])),coverage=Object.fromEntries(keys.map(k=>[k,0]));let kg=0,unquantified=0,quantified=0;
 for(const r of chosen){if(!known(r.amount)||(r.mode==='pack'&&(!known(r.packGrams)||Number(r.packGrams)<=0))){unquantified++;continue}
 const grams=finitePositive(r.amount)*(r.mode==='pack'?finitePositive(r.packGrams):1000);kg+=grams/1000;quantified++;
 for(const key of keys){if(known(r[key])){sums[key]+=grams/100*Number(r[key]);coverage[key]++}}
 if(!known(r.kcal))unquantified++;
 }
 const daily=finitePositive(people)*finitePositive(kcalPerPerson),target=daily*finitePositive(days),ready=daily>0&&target>0;
 return {...sums,coverage,quantified,kg,unquantified,target,ready,days:daily?sums.kcal/daily:0,percent:target?sums.kcal/target*100:0,gap:Math.max(0,target-sums.kcal)};
}
function packTotals(rows){return rows.reduce((out,r)=>{const a=String(r.bag??'offen');out[a]=(out[a]||0)+finitePositive(r.quantity)*finitePositive(r.grams)/1000;return out},{})}

window.P12DemoMath={foodTotals,packTotals};
})();
