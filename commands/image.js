/**
 * Ulric-X MD - Image effect commands
 * Applies filters to images using sharp (no API, all local processing).
 */
const sharp = require('sharp');
const utils = require('../lib/utils');

// Each effect: name, alias, description, sharp pipeline
const EFFECTS = [
  ['sepia',     ['sep'],  'Sepia tone',         (s) => s.modulate({saturation:1.2}).tint({r:112,g:66,b:20})],
  ['grayscale', ['gray','grey','bw'], 'Black & white', (s) => s.grayscale()],
  ['invert',    ['neg','negative'], 'Invert colors', (s) => s.negate()],
  ['blur',      ['blur5'], 'Blur effect',       (s) => s.blur(5)],
  ['blurstrong',['blur10'], 'Strong blur',      (s) => s.blur(15)],
  ['sharpen',   ['sharp'], 'Sharpen image',     (s) => s.sharpen()],
  ['bright',    ['brighten'], 'Brighten',       (s) => s.modulate({brightness:1.5})],
  ['dark',      ['darken'], 'Darken',           (s) => s.modulate({brightness:0.5})],
  ['saturate',  ['sat'],   'Increase saturation', (s) => s.modulate({saturation:2})],
  ['desaturate',['desat'], 'Decrease saturation', (s) => s.modulate({saturation:0.3})],
  ['hue',       ['hue90'], 'Hue shift 90',      (s) => s.modulate({hue:90})],
  ['hue180',    ['hue2'],  'Hue shift 180',     (s) => s.modulate({hue:180})],
  ['hue270',    ['hue3'],  'Hue shift 270',     (s) => s.modulate({hue:270})],
  ['red',       ['tintred'], 'Red tint',        (s) => s.tint({r:255,g:0,b:0})],
  ['green',     ['tintgreen'], 'Green tint',    (s) => s.tint({r:0,g:255,b:0})],
  ['blue',      ['tintblue'], 'Blue tint',      (s) => s.tint({r:0,g:0,b:255})],
  ['yellow',    ['tintyellow'], 'Yellow tint',  (s) => s.tint({r:255,g:255,b:0})],
  ['purple',    ['tintpurple'], 'Purple tint',  (s) => s.tint({r:128,g:0,b:128})],
  ['pink',      ['tintpink'], 'Pink tint',      (s) => s.tint({r:255,g:192,b:203})],
  ['orange',    ['tintorange'], 'Orange tint',  (s) => s.tint({r:255,g:165,b:0})],
  ['rotate90',  ['rot90','r90'], 'Rotate 90',   (s) => s.rotate(90)],
  ['rotate180', ['rot180','r180'], 'Rotate 180',(s) => s.rotate(180)],
  ['rotate270', ['rot270','r270'], 'Rotate 270',(s) => s.rotate(270)],
  ['flip',      ['verticalflip'], 'Flip vertical', (s) => s.flip()],
  ['flop',      ['horizontalflip'], 'Flip horizontal', (s) => s.flop()],
  ['mirror',    ['mir'], 'Mirror effect',      (s) => s.flop()],
  ['border',    ['b1'], 'Add border',          (s) => s.extend({top:10,bottom:10,left:10,right:10,background:'#000'})],
  ['borderred', ['bred'], 'Red border',         (s) => s.extend({top:10,bottom:10,left:10,right:10,background:'#f00'})],
  ['borderblue',['bblue'], 'Blue border',       (s) => s.extend({top:10,bottom:10,left:10,right:10,background:'#00f'})],
  ['circle',    ['round','circular'], 'Circle crop', (s) => s.composite([{input: Buffer.from(`<svg width="500" height="500"><circle cx="250" cy="250" r="250" fill="white"/></svg>`), blend: 'dest-in'}])],
  ['square',    ['sq'], 'Square crop',          (s) => s.resize(500,500,{fit:'cover'})],
  ['thumbnail', ['thumb'], 'Thumbnail',         (s) => s.resize(200,200,{fit:'cover'})],
  ['small',     ['sm'], 'Small size',           (s) => s.resize(400,400,{fit:'inside'})],
  ['medium',    ['md'], 'Medium size',          (s) => s.resize(800,800,{fit:'inside'})],
  ['large',     ['lg'], 'Large size',           (s) => s.resize(1200,1200,{fit:'inside'})],
  ['vintage',   ['vint'], 'Vintage look',       (s) => s.modulate({saturation:0.7,brightness:1.1}).tint({r:200,g:150,b:100})],
  ['cool',      ['coolfilter'], 'Cool filter',  (s) => s.modulate({hue:200,saturation:1.2})],
  ['warm',      ['warmfilter'], 'Warm filter',  (s) => s.modulate({hue:20,saturation:1.3,brightness:1.1})],
  ['noir',      ['noirfilm'], 'Noir film',      (s) => s.grayscale().modulate({brightness:0.9}).tint({r:50,g:50,b:50})],
  ['fade',      ['faded'], 'Fade effect',       (s) => s.modulate({saturation:0.5,brightness:1.2})],
  ['contrast',  ['highcontrast'], 'High contrast', (s) => s.linear(2.0, -128)],
  ['emboss',    ['embosseffect'], 'Emboss',     (s) => s.convolve({width:3,height:3,kernel:[-2,-1,0,-1,1,1,0,1,2]})],
  ['edge',      ['edgeeffect'], 'Edge detect',  (s) => s.convolve({width:3,height:3,kernel:[-1,-1,-1,-1,8,-1,-1,-1,-1]})],
  ['sharpen2',  ['sharper'], 'Extra sharpen',   (s) => s.sharpen({sigma:3})],
  ['softblur',  ['sblur'], 'Soft blur',         (s) => s.blur(2)],
  ['pixelate',  ['pixel'], 'Pixelate',          async (s) => { const b = await s.raw().toBuffer(); /* approximation */ return s.resize(50).resize(800,{kernel:'nearest'}); }],
  ['cartoon',   ['cartoonify'], 'Cartoonify',   (s) => s.sharpen().modulate({saturation:1.5})]
];

module.exports = EFFECTS.map(([name, alias, desc, fn]) => ({
  name, alias: alias || [], category: 'image', desc,
  handler: async (ctx) => {
    const buf = await ctx.downloadMsg().catch(()=>null) || await ctx.downloadQuoted().catch(()=>null);
    if (!buf) return ctx.reply(`Reply to or caption an image with .${name}`);
    try {
      let pipeline = sharp(buf, { failOnError: false });
      pipeline = fn(pipeline) || pipeline;
      const out = await pipeline.jpeg({ quality: 90 }).toBuffer();
      await ctx.sock.sendMessage(ctx.jid, { image: out, caption: `✅ ${desc}` }, { quoted: ctx.m });
    } catch (e) { ctx.reply('❌ ' + e.message); }
  }
}));
