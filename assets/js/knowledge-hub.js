(() => {
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const load = async (url, key) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Database request failed");
    const data = await response.json();
    if (!data || data.schemaVersion !== 1 || !Array.isArray(data[key])) throw new Error("Database format invalid");
    return data[key];
  };
  const bindDirectory = ({searchId,filterId,countId,resultsId,records,filterField,card}) => {
    const search=document.getElementById(searchId), filter=document.getElementById(filterId), count=document.getElementById(countId), results=document.getElementById(resultsId);
    if(!search||!filter||!count||!results)return;
    const render=()=>{
      const term=search.value.trim().toLocaleLowerCase(), selected=filter.value;
      const visible=records.filter(record=>(!selected||record[filterField]===selected)&&(!term||[record.name,record.title,record.faction,record.troopType,record.camp,record.summary,record.role,record.type,...(record.tags||[])].filter(Boolean).join(" ").toLocaleLowerCase().includes(term)));
      count.textContent=visible.length+(visible.length===1?" record":" records");
      results.innerHTML=visible.length?visible.map(card).join(""):'<div class="card knowledge-empty"><h3>No matching records</h3><p>Try a different search term or filter.</p></div>';
    };
    search.addEventListener("input",render);filter.addEventListener("change",render);render();
  };
  const heroRoot=document.getElementById("hero-results");
  if(heroRoot) load("data/heroes.json","heroes").then(records=>bindDirectory({
    searchId:"hero-search",filterId:"hero-faction",countId:"hero-count",resultsId:"hero-results",records,filterField:"faction",
    card:r=>'<article class="card knowledge-card"><span class="pill">'+escapeHtml(r.faction || "Faction pending")+'</span><h3>'+escapeHtml(r.name)+'</h3><p>'+escapeHtml(r.troopType || "Troop type pending")</p><p class="small muted">'+escapeHtml(r.note)+'</p></article>'
  })).catch(()=>{heroRoot.innerHTML='<div class="card"><h3>Hero index unavailable</h3><p>Please refresh to reload the local database.</p></div>';});
  const troopRoot=document.getElementById("troop-results");
  if(troopRoot) load("data/troops.json","troops").then(records=>bindDirectory({
    searchId:"troop-search",filterId:"troop-faction",countId:"troop-count",resultsId:"troop-results",records,filterField:"faction",
    card:r=>'<article class="card knowledge-card"><span class="pill">'+escapeHtml(r.faction)+'</span><h3>'+escapeHtml(r.name)+'</h3><p><strong>Camp:</strong> '+escapeHtml(r.camp)+'</p><p>'+escapeHtml(r.summary)+'</p><p class="small muted">'+escapeHtml(r.note)+'</p></article>'
  })).catch(()=>{troopRoot.innerHTML='<div class="card"><h3>Troop index unavailable</h3><p>Please refresh to reload the local database.</p></div>';});
  const eventRoot=document.getElementById("event-results");
  if(eventRoot) load("data/events.json","events").then(records=>bindDirectory({
    searchId:"event-search",filterId:"event-type",countId:"event-count",resultsId:"event-results",records,filterField:"type",
    card:r=>'<article class="card knowledge-card"><span class="pill">'+escapeHtml(r.type)+'</span><h3>'+escapeHtml(r.name)+'</h3><p>'+escapeHtml(r.summary)+'</p><p><strong>Preparation:</strong> '+escapeHtml(r.preparation)+'</p><p class="small muted">Schedule and rewards: check current in-game event details.</p></article>'
  })).catch(()=>{eventRoot.innerHTML='<div class="card"><h3>Event index unavailable</h3><p>Please refresh to reload the local database.</p></div>';});
})();