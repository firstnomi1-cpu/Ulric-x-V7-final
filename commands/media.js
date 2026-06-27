/**
 * Ulric-X MD - Media Effect Commands (60+)
 * Audio effects (bass, nightcore, slowed, 8d, etc.) + Video effects
 * Uses ffmpeg (free, no API key)
 */
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const utils = require('../lib/utils');

// Audio effect filters (ffmpeg audio filters)
const AUDIO_EFFECTS = [
  ['bass',       'bassboost', 'Increase bass',     'bass=g=15:f=200'],
  ['bassboost',  ['bb'],      'Heavy bass boost',  'bass=g=25:f=150'],
  ['treble',     ['trebleboost'], 'Treble boost',  'treble=g=15'],
  ['nightcore',  ['nc'],      'Nightcore (faster)', 'asetrate=44100*1.25,aresample=44100,atempo=1.05'],
  ['slowed',     ['slow'],    'Slowed + reverb',    'asetrate=44100*0.85,aresample=44100,atempo=0.95,aecho=0.8:0.9:1000:0.3'],
  ['reverb',     ['echo','rvb'], 'Reverb effect',   'aecho=0.8:0.9:1000:0.3'],
  ['echo2',      ['echo3'],   'Long echo',          'aecho=0.8:0.9:2000:0.5'],
  ['distortion', ['distort'], 'Distortion',         'distortion=dist=15'],
  ['8d',         ['8daudio'], '8D audio (rotate)',  'apulsator=hz=0.1'],
  ['vapor',      ['vaporwave'], 'Vaporwave',        'asetrate=44100*0.85,aresample=44100,atempo=0.95'],
  ['chipmunk',   ['chip'],    'Chipmunk voice',     'asetrate=44100*2,aresample=44100,atempo=0.5'],
  ['demon',      ['devil'],   'Demon voice',        'asetrate=44100*0.5,aresample=44100,atempo=2'],
  ['reverse',    ['revaudio'], 'Reverse audio',     'areverse'],
  ['speed',      ['fast'],    'Faster playback',    'atempo=2'],
  ['slowdown',   ['sd'],      'Slower playback',    'atempo=0.5'],
  ['fadein',     ['fadei'],   'Fade in',            'afade=t=in:st=0:d=5'],
  ['fadeout',    ['fadeo'],   'Fade out',           'afade=t=out:st=0:d=5'],
  ['volumeup',   ['volup'],   'Volume +200%',       'volume=3'],
  ['volumedown', ['voldown'], 'Volume -50%',        'volume=0.5'],
  ['mute',       ['silence'], 'Mute audio',         'volume=0'],
  ['highpass',   ['hp'],      'High pass filter',   'highpass=f=1000'],
  ['lowpass',    ['lp'],      'Low pass filter',    'lowpass=f=500'],
  ['robot',      ['robotvoice'], 'Robot voice',     'vibrato=f=100:d=1'],
  ['tremolo',    ['trem'],    'Tremolo effect',     'tremolo=f=10:d=0.5'],
  ['vibrato',    ['vib'],     'Vibrato effect',     'vibrato=f=8:d=0.7'],
  ['flanger',    ['flang'],   'Flanger effect',     'flanger'],
  ['chorus',     ['cho'],     'Chorus effect',      'chorus=0.5:0.5:50|60|40:0.4|0.32|0.3:0.25|0.4|0.3:2'],
  ['phaser',     ['phase'],   'Phaser effect',      'aphaser'],
  ['pitchup',    ['pitch+'],  'Pitch up',           'asetrate=44100*1.5,aresample=44100'],
  ['pitchdown',  ['pitch-'],  'Pitch down',         'asetrate=44100*0.75,aresample=44100'],
  ['basslow',    ['bassl'],   'Bass low boost',     'bass=g=10:f=80'],
  ['basshigh',   ['bassh'],   'Bass high cut',      'highpass=f=200,bass=g=20:f=100'],
  ['vocal',      ['vocalcut'], 'Vocal isolate',     'highpass=f=300,lowpass=f=3400'],
  ['karaoke',    ['kara'],    'Karaoke (vocal cut)','stereotools=mlev=1'],
  ['compressor', ['comp'],    'Audio compressor',   'compessor=threshold=0.1:ratio=5'],
  ['limiter',    ['limit'],   'Audio limiter',      'alimiter=limit=0.5'],
  ['gate',       ['noisegate'], 'Noise gate',       'agate=threshold=0.05'],
  ['stereo',     ['stereowide'], 'Wide stereo',     'stereotools=slev=3'],
  ['mono',       ['mono2'],   'Convert to mono',    'pan=mono|c0=0.5*c0+0.5*c1'],
  ['hall',       ['hallreverb'], 'Hall reverb',     'aecho=0.9:0.95:3000:0.5'],
  ['room',       ['roomreverb'], 'Room reverb',     'aecho=0.7:0.7:500:0.3'],
  ['plate',      ['platereverb'], 'Plate reverb',   'aecho=0.6:0.6:200:0.4'],
  ['spring',     ['springreverb'], 'Spring reverb', 'aecho=0.5:0.6:150:0.5'],
  ['shimmer',    ['shim'],    'Shimmer reverb',     'aecho=0.8:0.85:1500:0.6,aecho=0.5:0.4:2000:0.3']
];

// Video effect filters
const VIDEO_EFFECTS = [
  ['vreverse',   ['vidrev'],  'Reverse video',      'reverse'],
  ['vslowmo',    ['slowmo'],  'Slow motion',        'setpts=2.0*PTS'],
  ['vfast',      ['vidfast'], 'Speed up video',     'setpts=0.5*PTS'],
  ['vgrayscale', ['vidgray'], 'Grayscale video',    'hue=s=0'],
  ['vinvert',    ['vidneg'],  'Invert colors',      'negate'],
  ['vblur',      ['vidblur'], 'Blur video',         'boxblur=10:1'],
  ['vsharp',     ['vidsharp'],'Sharpen video',      'unsharp=5:5:1.0'],
  ['vmirror',    ['vidmir'],  'Mirror video',       'hflip'],
  ['vflip',      ['vidflip'], 'Flip video',         'vflip'],
  ['vrotate90',  ['vidrot90'],'Rotate 90°',         'transpose=1'],
  ['vrotate180', ['vidrot180'],'Rotate 180°',       'transpose=2,transpose=2'],
  ['vrotate270', ['vidrot270'],'Rotate 270°',       'transpose=2'],
  ['vintage',    ['vidvint'], 'Vintage video',      'hue=s=0.5:h=30,curves=vintage'],
  ['vsepia',     ['vidsep'],  'Sepia video',        'hue=s=0.5:h=30'],
  ['vbright',    ['vidbri'],  'Brighten video',     'eq=brightness=0.3'],
  ['vdark',      ['viddark'], 'Darken video',       'eq=brightness=-0.3'],
  ['vcontrast',  ['vidcon'],  'High contrast',      'eq=contrast=2.0'],
  ['vsaturation',['vidsat'],  'Saturate video',     'eq=saturation=2.5'],
  ['vhs',        ['vhseff'],  'VHS effect',         'hue=s=1.2,noise=alls=20:allf=t'],
  ['vglitch',    ['glitch'],  'Glitch effect',      'pixelize=10,noise=alls=30:allf=t'],
  ['vnoise',     ['vidnoise'], 'Video noise',       'noise=alls=15:allf=t'],
  ['vpixelate',  ['pix'],     'Pixelate video',     'pixelize=15'],
  ['vwave',      ['wav'],     'Wave effect',        'vibrato=2,vflip'],
  ['vshaky',     ['shaky'],   'Shaky cam',          'crop=iw:ih-20:0:10'],
  ['vcircle',    ['vidcirc'], 'Circle crop',        'crop=ih:ih:(iw-ih)/2:0'],
  ['vzoom',      ['vidzoom'], 'Zoom in',            'crop=iw/2:ih/2:iw/4:ih/4,scale=iw*2:ih*2']
];

module.exports = [
  // Audio effect commands
  ...AUDIO_EFFECTS.map(([name, alias, desc, filter]) => ({
    name, alias: alias || [], category: 'media', desc,
    handler: async (ctx) => {
      const buf = await ctx.downloadQuoted().catch(()=>null);
      if (!buf) return ctx.reply(`Reply to an audio with .${name}`);
      const inPath = `${os.tmpdir()}/ulric-${Date.now()}.in.mp3`;
      const outPath = `${os.tmpdir()}/ulric-${Date.now()}.out.mp3`;
      fs.writeFileSync(inPath, buf);
      exec(`ffmpeg -i "${inPath}" -af "${filter}" -y "${outPath}"`, (e) => {
        if (e) return ctx.reply('❌ ' + e.message.slice(0, 200));
        const out = fs.readFileSync(outPath);
        ctx.sock.sendMessage(ctx.jid, { audio: out, mimetype: 'audio/mpeg' }, { quoted: ctx.m });
        try { fs.unlinkSync(inPath); fs.unlinkSync(outPath); } catch {}
      });
    }
  })),

  // Video effect commands
  ...VIDEO_EFFECTS.map(([name, alias, desc, filter]) => ({
    name, alias: alias || [], category: 'media', desc,
    handler: async (ctx) => {
      const buf = await ctx.downloadQuoted().catch(()=>null);
      if (!buf) return ctx.reply(`Reply to a video with .${name}`);
      const inPath = `${os.tmpdir()}/ulric-${Date.now()}.in.mp4`;
      const outPath = `${os.tmpdir()}/ulric-${Date.now()}.out.mp4`;
      fs.writeFileSync(inPath, buf);
      exec(`ffmpeg -i "${inPath}" -vf "${filter}" -c:a copy -y "${outPath}"`, (e) => {
        if (e) return ctx.reply('❌ ' + e.message.slice(0, 200));
        const out = fs.readFileSync(outPath);
        ctx.sock.sendMessage(ctx.jid, { video: out, caption: `✅ ${desc}` }, { quoted: ctx.m });
        try { fs.unlinkSync(inPath); fs.unlinkSync(outPath); } catch {}
      });
    }
  })),

  // Combined conversions
  {
    name: 'vmute', alias: ['vidmute'], category: 'media', desc: 'Mute video audio',
    handler: async (ctx) => {
      const buf = await ctx.downloadQuoted().catch(()=>null);
      if (!buf) return ctx.reply('Reply to a video');
      const inPath = `${os.tmpdir()}/ulric-${Date.now()}.in.mp4`;
      const outPath = `${os.tmpdir()}/ulric-${Date.now()}.out.mp4`;
      fs.writeFileSync(inPath, buf);
      exec(`ffmpeg -i "${inPath}" -an -y "${outPath}"`, (e) => {
        if (e) return ctx.reply('❌ ' + e.message.slice(0, 200));
        const out = fs.readFileSync(outPath);
        ctx.sock.sendMessage(ctx.jid, { video: out, caption: '✅ Muted' }, { quoted: ctx.m });
        try { fs.unlinkSync(inPath); fs.unlinkSync(outPath); } catch {}
      });
    }
  },
  {
    name: 'vextractaudio', alias: ['vtoaudio','vtoa'], category: 'media', desc: 'Extract audio from video',
    handler: async (ctx) => {
      const buf = await ctx.downloadQuoted().catch(()=>null);
      if (!buf) return ctx.reply('Reply to a video');
      const inPath = `${os.tmpdir()}/ulric-${Date.now()}.in.mp4`;
      const outPath = `${os.tmpdir()}/ulric-${Date.now()}.out.mp3`;
      fs.writeFileSync(inPath, buf);
      exec(`ffmpeg -i "${inPath}" -vn -acodec libmp3lame -y "${outPath}"`, (e) => {
        if (e) return ctx.reply('❌ ' + e.message.slice(0, 200));
        const out = fs.readFileSync(outPath);
        ctx.sock.sendMessage(ctx.jid, { audio: out, mimetype: 'audio/mpeg' }, { quoted: ctx.m });
        try { fs.unlinkSync(inPath); fs.unlinkSync(outPath); } catch {}
      });
    }
  },
  {
    name: 'vtrim', alias: ['vidtrim'], category: 'media', desc: 'Trim video (start|duration in seconds)',
    handler: async (ctx) => {
      const [start, dur] = (ctx.q || '0|10').split('|').map(n => parseInt(n, 10));
      const buf = await ctx.downloadQuoted().catch(()=>null);
      if (!buf) return ctx.reply(`Reply to a video. Example: ${ctx.prefix}vtrim 5|10`);
      const inPath = `${os.tmpdir()}/ulric-${Date.now()}.in.mp4`;
      const outPath = `${os.tmpdir()}/ulric-${Date.now()}.out.mp4`;
      fs.writeFileSync(inPath, buf);
      exec(`ffmpeg -ss ${start} -i "${inPath}" -t ${dur} -c copy -y "${outPath}"`, (e) => {
        if (e) return ctx.reply('❌ ' + e.message.slice(0, 200));
        const out = fs.readFileSync(outPath);
        ctx.sock.sendMessage(ctx.jid, { video: out, caption: `✅ Trimmed ${start}-${start+dur}s` }, { quoted: ctx.m });
        try { fs.unlinkSync(inPath); fs.unlinkSync(outPath); } catch {}
      });
    }
  },
  {
    name: 'atrim', alias: ['audiotrim'], category: 'media', desc: 'Trim audio (start|duration)',
    handler: async (ctx) => {
      const [start, dur] = (ctx.q || '0|30').split('|').map(n => parseInt(n, 10));
      const buf = await ctx.downloadQuoted().catch(()=>null);
      if (!buf) return ctx.reply(`Reply to audio. Example: ${ctx.prefix}atrim 10|30`);
      const inPath = `${os.tmpdir()}/ulric-${Date.now()}.in.mp3`;
      const outPath = `${os.tmpdir()}/ulric-${Date.now()}.out.mp3`;
      fs.writeFileSync(inPath, buf);
      exec(`ffmpeg -ss ${start} -i "${inPath}" -t ${dur} -y "${outPath}"`, (e) => {
        if (e) return ctx.reply('❌ ' + e.message.slice(0, 200));
        const out = fs.readFileSync(outPath);
        ctx.sock.sendMessage(ctx.jid, { audio: out, mimetype: 'audio/mpeg' }, { quoted: ctx.m });
        try { fs.unlinkSync(inPath); fs.unlinkSync(outPath); } catch {}
      });
    }
  },
  {
    name: 'vconcat', alias: ['vidconcat'], category: 'media', desc: 'Concatenate 2 videos (reply to 1st)',
    handler: async (ctx) => ctx.reply('⚠️ Send 2 videos with captions, then use .vmerge')
  },
  {
    name: 'vmerge', alias: ['vidmerge'], category: 'media', desc: 'Merge last 2 quoted videos',
    handler: async (ctx) => ctx.reply('⚠️ For merging, use ffmpeg directly. This command is a placeholder.')
  }
];
