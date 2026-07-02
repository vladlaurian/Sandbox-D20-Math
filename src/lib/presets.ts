import { Preset } from '@/types/sandbox';

export const PRESETS: Preset[] = [
  { name: 'Interception vs Passive Passing', mode: 'duel', aLabel: 'Interception', bLabel: 'Passive Passing' },
  { name: 'Dribbling vs Passive 1vs1 Defending', mode: 'duel', aLabel: 'Dribbling', bLabel: 'Passive 1vs1 Defending' },
  { name: 'Deposedare vs Passive Ball Control', mode: 'duel', aLabel: 'Deposedare', bLabel: 'Passive Ball Control' },
  { name: 'Long Shot vs Passive Diving Saves', mode: 'duel', aLabel: 'Long Shot', bLabel: 'Passive Diving Saves' },
  { name: 'Finishing vs Passive Reflexes', mode: 'duel', aLabel: 'Finishing', bLabel: 'Passive Reflexes' },
  { name: 'Heading vs Passive Aerial', mode: 'duel', aLabel: 'Heading', bLabel: 'Passive Aerial' },
  { name: 'Heading vs Passive Reflexes', mode: 'duel', aLabel: 'Heading', bLabel: 'Passive Reflexes' },
  { name: 'Crossing vs țintă fixă 8', mode: 'target', aLabel: 'Crossing', defaultTarget: 8 },
  { name: 'Goalkeeper Claiming vs Crossing Score', mode: 'duel', aLabel: 'Goalkeeper Claiming', bLabel: 'Crossing Score' },
];
