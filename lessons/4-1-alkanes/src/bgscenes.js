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
})();
