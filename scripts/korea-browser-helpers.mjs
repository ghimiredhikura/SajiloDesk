// Exercise the visible task control; retain native fallback for no-JS checks.
export async function chooseTask(page,value,touch=false){
 const input=page.locator('#journey-task-search');
 if(await input.isVisible()){
  const toggle=page.locator('.visa-search-input').filter({has:input}).locator('button');
  await toggle[touch?'tap':'click']();
  await page.locator(`#journey-task-results [data-value="${value}"]`)[touch?'tap':'click']();
 }else await page.selectOption('#journey-task',value);
}
