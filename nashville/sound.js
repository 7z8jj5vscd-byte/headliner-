// Nashville: Make It or Fake It: real-sounding country music. A synthesized band (plucked acoustic guitar using a
// string model, upright-style bass, kick, snare and brushes, pedal steel slides and fiddle) plays every song in its
// own key and tempo, with a melody built from its theme: heartbreak sits in minor-leaning chords, love songs are
// bright, road songs are driving. Your genre changes the arrangement.

const SND={cache:{}};
const KEYROOT={'C':48,'D':50,'E':52,'F':53,'G':55,'A':57,'B♭':58};
function ksBuffer(c,midi,dur){const k=midi+':'+dur.toFixed(2);if(SND.cache[k])return SND.cache[k];const sr=c.sampleRate,N=Math.floor(sr*dur),f=NOTE(midi),P=Math.max(2,Math.round(sr/f));const b=c.createBuffer(1,N,sr),d=b.getChannelData(0);const ring=new Float32Array(P);for(let i=0;i<P;i++)ring[i]=Math.random()*2-1;let idx=0;const damp=.996-(midi>70?.004:0);
 for(let i=0;i<N;i++){const a=ring[idx],nx=ring[(idx+1)%P];const v=(a+nx)*.5*damp;ring[idx]=v;d[i]=a;idx=(idx+1)%P}SND.cache[k]=b;return b}
function gtr(t,midi,vol,dur){const c=actx();if(!c)return;const s=c.createBufferSource();s.buffer=ksBuffer(c,midi,dur||1.4);const g=c.createGain(),f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=4200;g.gain.value=vol;s.connect(f);f.connect(g);g.connect(AUD.master);s.start(t);if(AUD.track)AUD.track.push(s)}
function steel(t,midi,dur,vol){const c=actx();if(!c)return;const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter(),lfo=c.createOscillator(),lg=c.createGain();o.type='sine';o.frequency.setValueAtTime(NOTE(midi-2),t);o.frequency.exponentialRampToValueAtTime(NOTE(midi),t+.25);lfo.frequency.value=5.2;lg.gain.value=NOTE(midi)*.006;lfo.connect(lg);lg.connect(o.frequency);const o2=c.createOscillator();o2.type='triangle';o2.frequency.setValueAtTime(NOTE(midi-2)*2,t);o2.frequency.exponentialRampToValueAtTime(NOTE(midi)*2,t+.25);const g2=c.createGain();g2.gain.value=.25;o2.connect(g2);g2.connect(f);
 f.type='lowpass';f.frequency.value=2600;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.12);g.gain.setValueAtTime(vol,t+dur*.7);g.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(f);f.connect(g);g.connect(AUD.master);[o,o2,lfo].forEach(x=>{x.start(t);x.stop(t+dur+.05)});if(AUD.track)AUD.track.push(o,o2,lfo)}
function fiddle(t,midi,dur,vol){const c=actx();if(!c)return;const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter(),f2=c.createBiquadFilter(),lfo=c.createOscillator(),lg=c.createGain();o.type='sawtooth';o.frequency.value=NOTE(midi);lfo.frequency.value=6;lg.gain.value=NOTE(midi)*.008;lfo.connect(lg);lg.connect(o.frequency);f.type='bandpass';f.frequency.value=1500;f.Q.value=1.2;f2.type='lowpass';f2.frequency.value=3800;
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.08);g.gain.setValueAtTime(vol*.85,t+dur*.8);g.gain.linearRampToValueAtTime(0,t+dur);o.connect(f);f.connect(f2);f2.connect(g);g.connect(AUD.master);[o,lfo].forEach(x=>{x.start(t);x.stop(t+dur+.05)});if(AUD.track)AUD.track.push(o,lfo)}
function bass(t,midi,dur,vol){const c=actx();if(!c)return;const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type='triangle';o.frequency.value=NOTE(midi);f.type='lowpass';f.frequency.value=600;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(f);f.connect(g);g.connect(AUD.master);o.start(t);o.stop(t+dur+.05);if(AUD.track)AUD.track.push(o)}
// progressions as scale degrees from the root; minor-leaning ones for sad themes
const PROG_MAJ=[[0,7,9,5],[0,5,7,0],[0,9,5,7],[0,5,0,7],[0,7,5,5]],PROG_MIN=[[9,5,0,7],[9,7,5,0],[0,9,5,7],[9,5,7,7]];
const chordOf=(root,deg)=>{const minor=[2,4,9].includes(deg);const r=root+deg;return[r,r+(minor?3:4),r+7]};
const SCALE_MAJ=[0,2,4,7,9],SCALE_MIN=[0,3,5,7,10];
function songFor(seed){const s=typeof seed==='number'?S.songs.find(x=>x.id===seed):S&&S.songs&&S.songs.find(x=>x.title===seed);return s||null}
window.playTune=function(seed,bars){const c=actx();if(!c)return;stopTune();AUD.track=[];const s=songFor(seed);const r=seedRand(seed);bars=bars||4;
 const theme=s?s.theme:pick(['love','heartbreak','road']);const sad=['heartbreak','whiskey','redemption','faith','family'].includes(theme)&&r()<.75;const root=(KEYROOT[s&&s.key]||55-(r()<.5?7:0))-12+12;
 const bpm=s&&s.bpm?s.bpm:(sad?76:104)+Math.floor(r()*24);const b=60/bpm,t0=c.currentTime+.06;const prog=(sad?PROG_MIN:PROG_MAJ)[Math.floor(r()*(sad?PROG_MIN:PROG_MAJ).length)];const scale=sad?SCALE_MIN:SCALE_MAJ;
 const st=typeof genreStyle==='function'?genreStyle():'trad';const rock=st==='rock',pop=st==='pop',folk=st==='folk';const swing=folk||theme==='whiskey'?.08:0;
 let mel=root+12+scale[2];
 for(let i=0;i<bars;i++){const t=t0+i*4*b;const ch=chordOf(root,prog[i%4]);
  // acoustic guitar strums (boom-chick for trad, straight eighths for pop and rock)
  for(let k=0;k<4;k++){const tk=t+k*b+(k%2?swing*b:0);if(!pop||k%2===0)ch.concat([ch[0]+12]).forEach((n,j)=>gtr(tk+j*(k%2?.008:.014),n+(j===3?0:12),k%2?.05:.08,1.2));if(pop&&k%2)gtr(tk,ch[1]+12,.04,.6)}
  // bass: root and fifth
  bass(t,ch[0]-12,b*1.6,.28);bass(t+2*b,ch[0]-5,b*1.6,.24);if(!sad)bass(t+3.5*b,ch[0]-10,b*.4,.15);
  // drums: brushes for sad songs, kick and snare otherwise
  for(let k=0;k<4;k++){const tk=t+k*b;if(k%2===0)drum(tk,'kick',sad?.25:rock?.6:.45);else drum(tk,'snare',sad?.07:rock?.26:.18);drum(tk+b/2+swing*b,'hat',sad?.03:.05)}
  // melody: a stepwise line over the chord, fiddle or square-lead for pop
  const notes=sad?2:4;for(let k=0;k<notes;k++){if(r()<.25)continue;const step=Math.floor(r()*3)-1;const deg=scale.indexOf(((mel-root)%12+12)%12);mel=root+12+scale[clamp((deg<0?2:deg)+step,0,4)]+(r()<.15?12:0);if(i%4===3&&k===notes-1)mel=ch[0]+12;const tk=t+k*(4/notes)*b;if(pop)pluck(tk,mel+12,b*(4/notes)*.9,.05,'square');else if(folk||st==='trad')fiddle(tk,mel+12,b*(4/notes)*.95,.045);else pluck(tk,mel+12,b*(4/notes)*.9,.06,'sawtooth')}
  // pedal steel swells on the turnaround (not on pop songs)
  if(!pop&&(i%2===1||sad))steel(t+2*b,ch[2]+12,b*2.2,.05)}
 AUD.cur=AUD.track;AUD.track=null};
// karaoke: the now-playing screen highlights lines in time with the song
(function(){const _np=window.nowPlaying;if(_np)window.nowPlaying=function(id){const r=_np(id);const s=S.songs.find(x=>x.id===id);const lines=[...document.querySelectorAll('#mbody .lyr p, #mbody .karaoke p, #mbody .np-lyrics p')];if(lines.length&&s){const bpm=s.bpm||100,per=60/bpm*8*1000;let i=0;clearInterval(UI.kar);UI.kar=setInterval(()=>{if(!lines[0].isConnected)return clearInterval(UI.kar);lines.forEach((l,j)=>l.classList.toggle('sing',j===i));i=(i+1)%lines.length},per)}return r}})();
