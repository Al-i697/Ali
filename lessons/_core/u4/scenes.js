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
  /* more molecules for the alkenes and the cracking */
  R('mol_propene', {mols:[{m:'propene',x:.84,y:.5,s:1.2,spin:.28,pitch:.55}]});
  R('mol_butene',  {mols:[{m:'butene',x:.82,y:.5,s:1.15,spin:-.26,pitch:.5}]});
  R('mol_ethanol', {mols:[{m:'ethanol',x:.84,y:.5,s:1.2,spin:.3,pitch:.5}]});
  R('mol_dibromo', {mols:[{m:'dibromoethane',x:.82,y:.5,s:1.2,spin:.3,pitch:.5},{m:'br2',x:.12,y:.8,s:.8,spin:.5,pitch:.5,ph:1}]});
  R('mol_addn',    {mols:[{m:'ethene',x:.14,y:.3,s:.8,spin:.3,pitch:.5},{m:'br2',x:.12,y:.8,s:.8,spin:-.4,pitch:.5,ph:1},{m:'h2',x:.9,y:.22,s:.8,spin:.5,pitch:.5,ph:2},{m:'ethanol',x:.88,y:.78,s:.8,spin:-.3,pitch:.5,ph:3}],dust:30});
  R('mol_decane',  {mols:[{m:'chain10',x:.62,y:.56,s:1.5,spin:.16,pitch:.55}],dust:24});
  R('mol_crack',   {mols:[{m:'chain8',x:.7,y:.3,s:1.1,spin:.2,pitch:.5},{m:'butane',x:.2,y:.78,s:.8,spin:-.3,pitch:.5,ph:1},{m:'butene',x:.88,y:.84,s:.8,spin:.3,pitch:.5,ph:2}],dust:26});
  /* RETIRED by the teacher (Nov 2026): his first five photographs (u_*, 736 px enlarged about 1.7x). Not used by 4-1 any more and not to be used in new lessons;
     the files stay in the repository until 4-2 and 4-3 are rebuilt with new photos. See _core/tools/photo_usage.py. */
  R('p_pump_sky',  {bg:'u_pump_sky', dim:.26, dust:14});
  R('p_pump_head', {bg:'u_pump_head',dim:.30, dust:12, ph:1});
  R('p_pump_base', {bg:'u_pump_base',dim:.32, dust:12, ph:2});
  R('p_earth_top', {bg:'u_earth_top',dim:.30, dust:22});
  R('p_earth',     {bg:'u_earth',    dim:.30, dust:18, ph:1});
  R('p_earth_g',   {bg:'u_earth_g',  dim:.32, dust:20, ph:2});
  R('p_ref_top',   {bg:'u_ref_top',  dim:.40, dust:10});
  R('p_ref_mid',   {bg:'u_ref_mid',  dim:.40, dust:10, ph:1});
  R('p_ref_low',   {bg:'u_ref_low',  dim:.42, dust:10, ph:2});
  R('p_hands',     {bg:'u_hands',    dim:.10, dust:12});
  R('p_pipes_sun', {bg:'u_pipes_sun',dim:.36, dust:12});
  R('p_pipes_top', {bg:'u_pipes_top',dim:.36, dust:12, ph:1});
  R('p_pipes_sea', {bg:'u_pipes_sea',dim:.38, dust:12, ph:2});
  R('pm_ene',      {bg:'s_atom_bubbles',dim:.10, dust:10, mols:[{m:'ethene',x:.2,y:.5,s:1.15,spin:.3,pitch:.5}]});
  R('pm_ene2',     {bg:'s_blue_lab', dim:.16, dust:10, mols:[{m:'propene',x:.82,y:.5,s:1.05,spin:-.26,pitch:.5}]});
  R('pm_ethanol',  {bg:'s_atom_formulas',dim:.12, dust:10, mols:[{m:'ethanol',x:.2,y:.5,s:1.1,spin:.28,pitch:.5}]});
  R('pm_crack',    {bg:'s_molecules_circuit', dim:.22, dust:0,  mols:[{m:'chain8',x:.2,y:.52,s:1.2,spin:.2,pitch:.5}]});
  R('pm_crack2',   {bg:'s_pipes_refinery',dim:.22, dust:6,  mols:[{m:'chain10',x:.8,y:.55,s:1.35,spin:-.18,pitch:.5}]});
  /* the teacher's 11 high-resolution photographs (1600x900, see _core/tools/add_photos.py): they drift and zoom slowly like the others; the scrim is light because the cards carry the text */
  R('p_lab_future', {bg:'s_lab_future', dim:.12, dust:14});
  R('p_lab_desk',   {bg:'s_lab_desk',   dim:.16, dust:12, ph:1});
  R('p_plants_book',{bg:'s_plants_book',dim:.18, dust:12, ph:2});
  R('p_lab_frame',  {bg:'s_lab_frame',  dim:0,   dust:0});
  R('p_eco_hand',   {bg:'s_eco_hand',   dim:.16, dust:14, ph:1});
  R('p_earth_sad',  {bg:'s_earth_sad',  dim:.18, dust:8,  ph:2});
  R('p_pump_blue',  {bg:'s_pump_blue',  dim:.14, dust:8});
  R('p_pump_red',   {bg:'s_pump_red',   dim:.14, dust:8,  ph:1});
  R('p_refinery',   {bg:'s_refinery',   dim:.18, dust:8,  ph:2});
  R('p_tower',      {bg:'s_tower',      dim:.36, dust:8});
  R('p_well_layers',{bg:'s_well_layers',dim:.64, dust:6,  ph:1});   /* carries its own Arabic labels: pushed back */
  /* the teacher's second set (Nov 2026), same size and same engine. The scrim is light and soft: the photograph stays clear and the cards in front stay prominent. */
  R('p_blue_lab',       {bg:'s_blue_lab',       dim:.08, dust:10});
  R('p_atom_bubbles',   {bg:'s_atom_bubbles',   dim:.04, dust:6,  ph:1});
  R('p_hands_globe',    {bg:'s_hands_globe',    dim:.12, dust:8,  ph:2});
  R('p_crystal_flask',  {bg:'s_crystal_flask',  dim:.04, dust:8});
  R('p_lab_equations',  {bg:'s_lab_equations',  dim:.12, dust:6,  ph:1});
  R('p_atom_formulas',  {bg:'s_atom_formulas',  dim:.12, dust:6,  ph:2});
  R('p_molecules_circuit',{bg:'s_molecules_circuit',dim:.14,dust:0});
  R('p_glass_lab',      {bg:'s_glass_lab',      dim:.02, dust:0});   /* light picture: almost no shade */
  R('p_periodic_neon',  {bg:'s_periodic_neon',  dim:.20, dust:0});
  R('p_periodic_purple',{bg:'s_periodic_purple',dim:.16, dust:0});
  R('p_pipes_refinery', {bg:'s_pipes_refinery', dim:.14, dust:6});
  R('p_platform_sea',   {bg:'s_platform_sea',   dim:.14, dust:6,  ph:1});
  R('p_pumps_silhouette',{bg:'s_pumps_silhouette',dim:.10,dust:4, ph:2});
  R('p_port_tanks',     {bg:'s_port_tanks',     dim:.16, dust:4});
  R('p_oil_city',       {bg:'s_oil_city',       dim:.14, dust:6,  ph:1});
  R('p_biofuel_pump',   {bg:'s_biofuel_pump',   dim:.12, dust:10});
  R('p_solar_farm',     {bg:'s_solar_farm',     dim:.10, dust:4,  ph:2});
  R('p_bulb_tree',      {bg:'s_bulb_tree',      dim:.10, dust:8});
  /* unit 1 (metals): the lattice of positive ions with a sea of free electrons, and the teacher's seven metal photographs (Nov 2026) */
  R('mol_metal',    {mols:[{m:'metal',x:.84,y:.5,s:1.3,spin:.2,pitch:.34}],dust:24});
  R('mol_metal_l',  {mols:[{m:'metal',x:.16,y:.52,s:1.25,spin:-.18,pitch:.4}],dust:22});
  R('p_m_smith',    {bg:'s_m_smith',    dim:.08, dust:10});
  R('p_m_gold_mine',{bg:'s_m_gold_mine',dim:.14, dust:8,  ph:1});
  R('p_m_gold_ore', {bg:'s_m_gold_ore', dim:.12, dust:8,  ph:2});
  R('p_m_samples',  {bg:'s_m_samples',  dim:.10, dust:6});
  R('p_m_collage',  {bg:'s_m_collage',  dim:0,   dust:0});   /* white dividing lines: used as a picture inside a slide, not as a backdrop */
  R('p_m_pour',     {bg:'s_m_pour',     dim:.08, dust:6,  ph:1});
  R('p_m_pylons',   {bg:'s_m_pylons',   dim:.08, dust:4,  ph:2});
  /* the teacher's metal photographs, second batch (Nov 2026): used as decoration, they do not have to match the slide */
  R('p_m_bulb',     {bg:'s_m_bulb',     dim:.04, dust:10});
  R('p_m_gears',    {bg:'s_m_gears',    dim:.14, dust:6,  ph:1});
  R('p_m_coils',    {bg:'s_m_coils',    dim:.10, dust:4,  ph:2});
  R('p_m_lab',      {bg:'s_m_lab',      dim:.10, dust:6});
  R('p_m_coins',    {bg:'s_m_coins',    dim:.22, dust:6,  ph:1});   /* blurred on purpose: the coin legends must stay unreadable */
  /* third batch (Nov 2026): a clean pipette bench, zinc in copper(II) sulfate, K / Na / Mg in water. The template with the phone frame (no. 59) is not used. */
  R('p_lab_pipettes',{bg:'s_lab_pipettes',dim:.02, dust:0});   /* light picture: almost no shade */
  R('p_m_zn_cu',    {bg:'s_m_zn_cu',    dim:.12, dust:6,  ph:1});
  R('p_m_k_na_mg',  {bg:'s_m_k_na_mg',  dim:.10, dust:6,  ph:2});
  /* fourth batch (Nov 2026, unit 2: extraction, alloys, rusting). Not used as backgrounds: the mineral chart (Arabic labels + a stock-photo watermark) and the Zn + CuSO4 picture with its printed equation. */
  R('p_e_furnace_ore', {bg:'s_e_furnace_ore',   dim:.12, dust:6,  ph:1});
  R('p_e_blue_lab',    {bg:'s_e_blue_lab',      dim:.04, dust:8,  ph:2});
  R('p_e_malachite',   {bg:'s_e_mine_malachite',dim:.12, dust:6,  ph:3});
  R('p_e_cubes',       {bg:'s_e_cu_zn_cubes',   dim:.08, dust:4,  ph:4});   /* labels blurred on purpose */
  R('p_e_ptable',      {bg:'s_e_ptable_metals', dim:.24, dust:4,  ph:5});   /* the printed tiles are blurred on purpose (their text must stay unreadable), and the picture is shaded so the slide text wins */
  R('p_e_beakers',     {bg:'s_e_beakers',       dim:.10, dust:4,  ph:6});
  R('p_e_electrolysis',{bg:'s_e_electrolysis',  dim:.12, dust:6,  ph:7});
  R('p_e_pour',        {bg:'s_e_pour_ingots',   dim:.12, dust:8,  ph:8});
  R('p_e_sunset',      {bg:'s_e_mine_sunset',   dim:.12, dust:6,  ph:9});
  /* plain backgrounds (no picture): the palette of the slide with a few soft lights. The teacher dislikes repeated pictures (Nov 2026), so a slide may stay plain instead. */
  R('p_plain_a', {dust:12, seed:3});
  R('p_plain_b', {dust:6,  seed:11});
  R('p_plain_c', {dust:20, seed:23});
  R('p_plain_d', {dust:0,  seed:5});
})();
