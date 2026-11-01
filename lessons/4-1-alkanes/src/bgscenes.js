/* ---------- the 3D molecule backgrounds of this lesson (scenes are drawn live by MOL3D, see _core/mol3d.js) ---------- */
(function(){
  function R(n,s){BG.register(n,MOL3D.scene(s))}
  R('mol_carbon',  {mols:[{m:'diamond',x:.84,y:.52,s:1.05,spin:.16,pitch:.4},{m:'graphite',x:.10,y:.22,s:.6,spin:.12,pitch:1.05,ph:1}],dust:34});
  R('mol_methane', {mols:[{m:'methane',x:.84,y:.5,s:1.25,spin:.34,pitch:.45}]});
  R('mol_ethane',  {mols:[{m:'ethane',x:.84,y:.5,s:1.2,spin:.3,pitch:.5}]});
  R('mol_propane', {mols:[{m:'propane',x:.84,y:.5,s:1.2,spin:.28,pitch:.55}]});
  R('mol_butane',  {mols:[{m:'butane',x:.14,y:.5,s:1.15,spin:-.26,pitch:.5}]});
  R('mol_pentane', {mols:[{m:'pentane',x:.84,y:.5,s:1.2,spin:.24,pitch:.5}]});
  R('mol_hexane',  {mols:[{m:'hexane',x:.78,y:.52,s:1.25,spin:.22,pitch:.5}]});
  R('mol_chain',   {mols:[{m:'chain12',x:.58,y:.58,s:1.6,spin:.16,pitch:.55}],dust:26});
  R('mol_burn',    {mols:[{m:'ethane',x:.8,y:.6,s:1.1,spin:.3,pitch:.5},{m:'o2',x:.1,y:.78,s:.9,spin:.5,pitch:.5},{m:'co2',x:.9,y:.16,s:.85,spin:.45,pitch:.5,ph:1},{m:'h2o',x:.2,y:.2,s:.95,spin:.4,pitch:.5,ph:2}]});
  R('mol_family',  {mols:[{m:'methane',x:.1,y:.2,s:.7,spin:.3,pitch:.45},{m:'ethane',x:.9,y:.2,s:.7,spin:-.3,pitch:.5},{m:'propane',x:.9,y:.84,s:.7,spin:.3,pitch:.5},{m:'butane',x:.1,y:.84,s:.7,spin:-.25,pitch:.5}],dust:30});
  R('mol_ethene',  {mols:[{m:'ethene',x:.84,y:.5,s:1.2,spin:.3,pitch:.5},{m:'ethane',x:.14,y:.76,s:.8,spin:-.3,pitch:.5}]});
  R('mol_ring',    {mols:[{m:'ring',x:.84,y:.5,s:1.1,spin:.22,pitch:.9}]});
  /* photo backgrounds from the NotebookLM deck (see _core/tools/make_bg.py), some with a live 3D molecule on top */
  R('p_leaf',    {bg:'nb_leaf',   dim:.18, dust:22});
  R('p_leaf_g',  {bg:'nb_leaf_g', dim:.22, dust:22, ph:1});
  R('p_leaf_v',  {bg:'nb_leaf_v', dim:.20, dust:22, ph:2});
  R('p_leaf_z',  {bg:'nb_leaf_z', dim:.24, dust:18, ph:3});
  R('p_leaf_d',  {bg:'nb_leaf_d', dim:.14, dust:24, ph:4});
  R('p_table',   {bg:'nb_table',  dim:.34, dust:14});
  R('p_table_v', {bg:'nb_table_v',dim:.34, dust:14, ph:1});
  R('p_rig',     {bg:'nb_rig',    dim:.32, dust:12});
  R('p_rig_s',   {bg:'nb_rig_s',  dim:.34, dust:12, ph:1});
  R('p_rig_o',   {bg:'nb_rig_o',  dim:.32, dust:12, ph:2});
  R('pm_ethane', {bg:'nb_leaf_d', dim:.14, dust:20, mols:[{m:'ethane',x:.2,y:.52,s:1.15,spin:.3,pitch:.5}]});
  R('pm_family', {bg:'nb_leaf_v', dim:.20, dust:18, mols:[{m:'methane',x:.12,y:.22,s:.62,spin:.3,pitch:.45},{m:'propane',x:.9,y:.84,s:.62,spin:-.28,pitch:.5}]});
  R('pm_butane', {bg:'nb_leaf_g', dim:.22, dust:16, mols:[{m:'butane',x:.82,y:.5,s:1.0,spin:.24,pitch:.5}]});
})();
