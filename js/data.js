/* ==========================================================
   data.js - all mystery cases live here.
   To add a new case, copy one object and change the story.

   Structure of a case:
     id, title, difficulty, base (max score), place, theme (colors)
     summary   : short text for the case card
     briefing  : story shown at the top of the case
     clues     : { id: { title, type, text } }
     locations : places that can be investigated -> reveal clues
     suspects  : people with questions -> reveal clues
     methods / motives : choices for the final accusation
     solution  : { suspect, method, motive, explain }
     hints     : revealed one by one (each costs points)
   ========================================================== */

const CASES = [

  /* ------------------------------------------------------ CASE 1 */
  {
    id: 'library-heist',
    title: 'The Midnight Library Heist',
    difficulty: 'Easy',
    base: 800,
    place: 'Heritage Library, Ahmedabad',
    theme: ['#1f3a5f', '#0f1d33'],
    summary: 'A priceless manuscript vanishes from a sealed vault. The door was opened with a valid keycard - but the owner was 14 km away.',
    briefing: 'The 17th-century illuminated <i>Gulistan Folio</i> disappeared from the Heritage Library vault between 11:30 PM and 12:30 AM. There was no forced entry. The vault opens only with a staff keycard, and the door log shows that Librarian Meera Joshi\'s card was used at 11:52 PM. Interview the suspects, search the scene and work out who really took the folio.',
    clues: {
      c1: { type: 'Forensic', title: 'Vault lock is untouched', text: 'No tool marks anywhere on the vault lock or hinges. The door log shows card #0417 (Meera Joshi) opened it at 11:52 PM.' },
      c2: { type: 'Digital', title: 'Camera 3 was switched off', text: 'The corridor camera was offline from 11:40 PM to 12:10 AM. The power cable was unplugged by hand - it was not a technical fault.' },
      c3: { type: 'Document', title: 'Meera\'s hospital receipt', text: 'A hospital receipt stamped 11:31 PM shows Meera was admitting her father at a hospital 14 km away. She could not have used her card at 11:52 PM.' },
      c4: { type: 'Digital', title: 'Duplicate card printed at 9:04 PM', text: 'The card-printer log shows a duplicate of card #0417 was printed at 9:04 PM from the login "intern_kabir".' },
      c5: { type: 'Testimony', title: 'Guard saw the intern late', text: 'Ramesh says intern Kabir was still inside around 9 PM, and that Prof. Desai had already left by 7 PM.' },
      c6: { type: 'Document', title: 'Betting-app payment slip', text: 'A crumpled screenshot printout in the staff lounge bin: "Payment overdue - Rs. 3,00,000". The account name is Kabir Shah.' },
      c7: { type: 'Document', title: 'Entrance register', text: 'The staff sign-out register shows Kabir Shah left at 9:20 PM, not at 6 PM as he claims.' },
      c8: { type: 'Testimony', title: 'Professor was refused the folio', text: 'Prof. Desai admits he asked to study the folio last week and was refused. He was annoyed - but says he never went near the vault.' },
      c9: { type: 'Testimony', title: 'Only interns print cards', text: 'Meera explains that only interns operate the card printer, and nobody supervises it after 6 PM.' },
      c10: { type: 'Digital', title: 'Professor\'s conference recording', text: 'Prof. Desai was on a recorded online conference from 11:15 PM to 1:00 AM. The recording shows him on screen the whole time.' },
      c11: { type: 'Testimony', title: 'Overheard phone call', text: 'Prof. Desai overheard Kabir begging someone for "more time" about "betting money" earlier this week.' }
    },
    locations: [
      { id: 'l1', name: 'Rare Books Vault', teaser: 'The empty display case and the vault door.', result: 'You examine the heavy steel door under a torch. The lock is spotless - nobody forced it. The access panel confirms a valid card swipe at 11:52 PM.', clues: ['c1'] },
      { id: 'l2', name: 'CCTV Control Room', teaser: 'Monitors, recorders and a tangle of cables.', result: 'Camera 3 shows a black gap in the footage. Behind the rack you find its plug pulled out and left on the floor.', clues: ['c2'] },
      { id: 'l3', name: 'Card Printer Room', teaser: 'Where staff ID cards are produced.', result: 'The printer\'s memory still holds a job history. One entry stands out immediately.', clues: ['c4'] },
      { id: 'l4', name: 'Staff Lounge', teaser: 'Lockers, a kettle and an overflowing bin.', result: 'Rummaging through the bin you find a crumpled printout hidden under tea bags.', clues: ['c6'] },
      { id: 'l5', name: 'Main Entrance Desk', teaser: 'The guard desk and sign-in registers.', result: 'You flip back through the evening\'s staff sign-out register and compare the times.', clues: ['c7'] }
    ],
    suspects: [
      {
        id: 's1', name: 'Meera Joshi', role: 'Head Librarian', bio: 'Fifteen years at the library. Owner of keycard #0417. Calm, precise, and visibly shaken tonight.',
        questions: [
          { id: 'q1', q: 'Where were you at 11:50 PM?', a: '"At City Care Hospital. My father had chest pain and I rushed him in around 11:15. I have the admission receipt."', clues: ['c3'] },
          { id: 'q2', q: 'Who can print or duplicate keycards?', a: '"Only the interns operate the printer, and after 6 PM nobody supervises that room. I have been asking management to fix that."', clues: ['c9'] },
          { id: 'q3', q: 'Any enemies at work?', a: '"None that I know of. I\'m strict about rules, but I\'ve never had a real quarrel with anyone."', clues: [] }
        ]
      },
      {
        id: 's2', name: 'Ramesh Patel', role: 'Night Security Guard', bio: 'Ex-army, 8 years on the night shift. Patrols the ground floor on a fixed schedule.',
        questions: [
          { id: 'q1', q: 'What did you notice on your 11:45 PM patrol?', a: '"Nothing, sir. The ground floor was quiet. I never go near the vault - guards are not given vault access."', clues: [] },
          { id: 'q2', q: 'Who stayed late tonight?', a: '"The intern, Kabir, was still inside near 9 PM, finishing some \'cataloguing\'. Professor Desai left by 7."', clues: ['c5'] },
          { id: 'q3', q: 'Have you ever lent your card to anyone?', a: '"Never. And mine does not open the vault anyway."', clues: [] }
        ]
      },
      {
        id: 's3', name: 'Prof. Arvind Desai', role: 'Visiting Researcher', bio: 'Historian studying Persian manuscripts. Has been working at the library for three weeks.',
        questions: [
          { id: 'q1', q: 'Did you want access to the Gulistan Folio?', a: '"Yes - I asked last week and Ms. Joshi refused. I was annoyed, but I\'m a scholar, not a thief."', clues: ['c8'] },
          { id: 'q2', q: 'Where were you around midnight?', a: '"On an international video conference, 11:15 to 1:00. It was recorded, you can check."', clues: ['c10'] },
          { id: 'q3', q: 'Have you noticed anything odd lately?', a: '"The intern seemed very stressed. I overheard him on a call pleading for more time, something about betting money."', clues: ['c11'] }
        ]
      },
      {
        id: 's4', name: 'Kabir Shah', role: 'Library Intern', bio: '22-year-old intern. Helpful, a little nervous, handles cataloguing and visitor passes.',
        questions: [
          { id: 'q1', q: 'When did you leave the library?', a: '"Around 6 PM sharp, like always. I went straight home."', clues: [] },
          { id: 'q2', q: 'Do you handle ID cards?', a: '"Only visitor passes. Nothing to do with staff cards."', clues: [] },
          { id: 'q3', q: 'Are you under any financial pressure?', a: '"No, not at all. My stipend is enough for me."', clues: [] }
        ]
      }
    ],
    methods: ['Forced the vault lock', 'Used a cloned keycard', 'Hid inside after closing', 'Bribed the night guard'],
    motives: ['Revenge on the library', 'Gambling debts', 'Academic rivalry', 'Blackmail'],
    solution: {
      suspect: 's4', method: 'Used a cloned keycard', motive: 'Gambling debts',
      explain: 'Kabir printed a duplicate of Meera\'s keycard at 9:04 PM, unplugged Camera 3, and used the clone at 11:52 PM while Meera was at the hospital. He lied about leaving at 6 PM (the register says 9:20 PM) and a betting-app slip for Rs. 3,00,000 links him to desperate money trouble.'
    },
    hints: [
      'The vault was opened with a valid card - so ask who could have made a second one.',
      'Compare what Kabir says about his timings with the entrance register and the printer log.',
      'Meera has a hospital receipt, the professor has a recording. Only one suspect has no alibi and a money problem.'
    ]
  },

  /* ------------------------------------------------------ CASE 2 */
  {
    id: 'cafe-poison',
    title: 'Poison at the Sabarmati Cafe',
    difficulty: 'Medium',
    base: 1000,
    place: 'Sabarmati Cafe, Ahmedabad',
    theme: ['#5c3a1e', '#2a1a0d'],
    summary: 'The cafe owner collapses after his evening chai. Everyone is blaming the tea - but the lab says otherwise.',
    briefing: 'Dhruv Mehta, owner of the popular Sabarmati Cafe, collapsed at 8:40 PM on Tuesday soon after closing and is now in intensive care. Doctors report a toxic dose of a prescription drug he never prescribed himself. The staff insist it must have been the chai. Four people had reason, or opportunity, to be near him that night. Find out how it was done and who did it.',
    clues: {
      d1: { type: 'Forensic', title: 'Toxicology: not the chai', text: 'The poison was traced to residue from capsule shells in Dhruv\'s stomach. The chai he drank was not the source.' },
      d2: { type: 'Forensic', title: 'Kitchen items tested clean', text: 'The chai pot, sugar jar and Dhruv\'s water bottle all tested clean in the lab.' },
      d3: { type: 'Physical', title: 'Pill organiser was tampered with', text: 'Tuesday\'s slot in Dhruv\'s weekly pill organiser holds capsules from a different batch, re-sealed with a glossy finish. The organiser is kept in a locked drawer; only two spare keys exist - Dhruv\'s and one held by his business partner.' },
      d4: { type: 'Document', title: 'Rs. 18 lakh siphoned', text: 'Over six months Rs. 18 lakh was transferred out of the cafe\'s account in small amounts, all through a login ending in "NK".' },
      d5: { type: 'Document', title: 'Dhruv\'s handwritten note', text: '"Confront N. about the accounts - Tuesday after close. Do NOT mention to anyone."' },
      d6: { type: 'Digital', title: 'Back-door camera', text: 'The back-lane camera shows Neha Kapoor entering at 8:15 PM and leaving at 8:31 PM carrying her handbag.' },
      d7: { type: 'Testimony', title: 'Neha\'s car in the lane', text: 'Sunil says he noticed Neha\'s white hatchback parked in the back lane around 8 PM, even though she told everyone she was in Mumbai.' },
      d8: { type: 'Testimony', title: 'Chef\'s alibi', text: 'Imran was plating a 40-guest catering order until 9 PM in full view of the kitchen crew and the clients. He argued with Dhruv last week, but over menu pricing.' },
      d9: { type: 'Document', title: 'Anita\'s hotel bill', text: 'Anita was in Pune with her children - a hotel bill and photographs place her there from Monday to Wednesday. The divorce settlement was closed two years ago.' },
      d10: { type: 'Testimony', title: 'Dhruv took the capsule at 8:35', text: 'Sunil saw Dhruv take his usual capsule from the box and wash it down with the chai he brought at 8:35 PM.' },
      d11: { type: 'Testimony', title: 'Who has the drawer key?', text: 'Neha admits the drawer has two keys - Dhruv\'s and hers - "kept for emergencies".' }
    },
    locations: [
      { id: 'l1', name: 'City Hospital - Toxicology Desk', teaser: 'Lab reports and samples from last night.', result: 'The toxicologist walks you through the report. The pattern is clear and it points away from the tea.', clues: ['d1'] },
      { id: 'l2', name: 'Cafe Kitchen', teaser: 'Chai pot, sugar jar, spice racks.', result: 'Police had already sent samples from every item Dhruv might have consumed. You read the lab sheet pinned beside the stove.', clues: ['d2'] },
      { id: 'l3', name: 'Dhruv\'s Office', teaser: 'A locked drawer, a desk and a notepad.', result: 'Inside the drawer is a weekly pill organiser. You also find a note torn from a pad, pushed under the blotter.', clues: ['d3', 'd5'] },
      { id: 'l4', name: 'Accounts Room', teaser: 'Ledgers, a laptop and a printer.', result: 'The audit printout on the table shows a pattern of small transfers made late at night.', clues: ['d4'] },
      { id: 'l5', name: 'Back-lane CCTV', teaser: 'The camera covering the staff entrance.', result: 'You scrub through the footage of Tuesday evening, from 7:30 PM onwards.', clues: ['d6'] }
    ],
    suspects: [
      {
        id: 's1', name: 'Neha Kapoor', role: 'Business Partner', bio: 'Co-founder who handles finance and suppliers. Dhruv\'s partner for nine years. Says she was in Mumbai on Tuesday.',
        questions: [
          { id: 'q1', q: 'Where were you on Tuesday evening?', a: '"In Mumbai, meeting a supplier. I only came back Wednesday morning when I heard the news."', clues: [] },
          { id: 'q2', q: 'Who can open Dhruv\'s desk drawer?', a: '"Dhruv, and me - we each keep a key in case of emergencies. Why, is that important?"', clues: ['d11'] },
          { id: 'q3', q: 'Were there any problems with the accounts?', a: '"Nothing serious. A few small mismatches, the usual. Dhruv was a bit dramatic about numbers."', clues: [] }
        ]
      },
      {
        id: 's2', name: 'Imran Qureshi', role: 'Head Chef', bio: 'Hot-tempered but gifted. Joined five years ago. Had a public argument with Dhruv last week.',
        questions: [
          { id: 'q1', q: 'You argued with Dhruv. What about?', a: '"Pricing on the new menu. It was loud, yes, but it was last week and we made up."', clues: [] },
          { id: 'q2', q: 'Where were you from 8 to 9 PM?', a: '"Plating a catering order for forty guests. Ask the clients, ask my crew."', clues: ['d8'] },
          { id: 'q3', q: 'Does anyone else touch the sugar or chai?', a: '"Only Sunil carries the chai out. I test everything myself - it\'s clean, I promise."', clues: [] }
        ]
      },
      {
        id: 's3', name: 'Sunil Yadav', role: 'Senior Waiter', bio: 'Has served at the cafe since it opened. Brought Dhruv his evening chai every day for six years.',
        questions: [
          { id: 'q1', q: 'Walk me through that evening.', a: '"I brought sir his chai at 8:35. He took his capsule from the box as always, drank the chai, and a few minutes later he collapsed."', clues: ['d10'] },
          { id: 'q2', q: 'Did you see anyone unusual around?', a: '"Around eight I saw Madam Neha\'s white car parked in the back lane. I thought she was in Mumbai, so I was surprised."', clues: ['d7'] },
          { id: 'q3', q: 'Did Dhruv seem worried recently?', a: '"A little quiet, yes. He was staring at the accounts a lot last week."', clues: [] }
        ]
      },
      {
        id: 's4', name: 'Anita Mehta', role: 'Ex-wife', bio: 'Divorced from Dhruv two years ago. Lives in Pune with their two children. Rumoured to have wanted a bigger settlement.',
        questions: [
          { id: 'q1', q: 'Where were you on Tuesday?', a: '"In Pune with my kids all week. I can show you the hotel bill and our photos."', clues: ['d9'] },
          { id: 'q2', q: 'Do you still hold a claim on the cafe?', a: '"None. The settlement was finished two years ago. I want nothing from that place."', clues: [] },
          { id: 'q3', q: 'Who would want Dhruv harmed?', a: '"I honestly don\'t know. He trusted his partner completely - too much, I used to tell him."', clues: [] }
        ]
      }
    ],
    methods: ['Poisoned the chai', 'Tampered with his daily capsules', 'Contaminated the sugar jar', 'Spiked his water bottle'],
    motives: ['Inheritance', 'Hiding embezzlement', 'Jealousy over a recipe', 'Revenge for being fired'],
    solution: {
      suspect: 's1', method: 'Tampered with his daily capsules', motive: 'Hiding embezzlement',
      explain: 'Neha had been siphoning Rs. 18 lakh through her own login. Dhruv found out and planned to confront her on Tuesday. She secretly returned from Mumbai, used her spare drawer key to swap Tuesday\'s capsules, and left by the back door at 8:31 PM. Dhruv took the tampered capsule at 8:35 PM, which is why the chai tested clean.'
    },
    hints: [
      'Everything Dhruv ate and drank tested clean. Look at what he took besides food.',
      'Who had a key to the drawer where the pills were kept?',
      'One suspect claimed to be far away - but a camera and a waiter disagree.'
    ]
  },

  /* ------------------------------------------------------ CASE 3 */
  {
    id: 'vanishing-monsoon',
    title: 'The Vanishing Monsoon',
    difficulty: 'Hard',
    base: 1200,
    place: 'Kala Sangam Gallery, Ahmedabad',
    theme: ['#2d4a3e', '#102019'],
    summary: 'A Rs. 4 crore painting disappears on opening night with the alarm silent. Four people look guilty - only one is.',
    briefing: 'On the night of the gallery opening, the centrepiece painting <i>Monsoon at Dusk</i> (insured for Rs. 4 crore) was found missing at 2:30 AM. The security alarm never rang. Everyone has a story and almost everyone has a secret. Not all clues point the same way - weigh them carefully before you accuse anyone.',
    clues: {
      e1: { type: 'Digital', title: 'Alarm disarmed from inside', text: 'The alarm panel log shows the system was disarmed at 2:07 AM using the code "CUR-01" - the curator\'s code - from the internal panel, not remotely.' },
      e2: { type: 'Forensic', title: 'Skylight undisturbed', text: 'Thick dust lies unbroken on the skylight latch and frame. Nobody climbed in or out that way.' },
      e3: { type: 'Document', title: 'Insurance cover doubled', text: 'The policy on <i>Monsoon at Dusk</i> was raised from Rs. 2 crore to Rs. 4 crore one month ago. The change form is signed by Farah Sheikh.' },
      e4: { type: 'Document', title: 'Gallery loan notice', text: 'A final notice from a private lender: Rs. 1.2 crore owed by the gallery, due this month, with Farah Sheikh as guarantor.' },
      e5: { type: 'Forensic', title: 'Clean nail holes', text: 'The wall behind the empty frame is dust-free around the nail holes - the painting was taken down carefully, not ripped off in a hurry.' },
      e6: { type: 'Testimony', title: 'Security chief locked in', text: 'Harsh Trivedi\'s security-room door log shows it was locked from outside by the cleaning contractor from 1:30 to 2:20 AM. He was stuck there, with a phone call logged to the contractor at 2:00 AM.' },
      e7: { type: 'Testimony', title: 'Insurance agent\'s alibi', text: 'Tanvi Bose left the party at 1:00 AM; her cab receipt and hotel check-in at 1:25 AM confirm it.' },
      e8: { type: 'Document', title: 'Artist\'s unpaid royalty', text: 'Vikram Rao is owed Rs. 6 lakh by the gallery in royalties and openly threatened legal action. This gives him motive - but not necessarily opportunity.' },
      e9: { type: 'Forensic', title: 'Crate holds only sketches', text: 'The large crate Vikram wheeled out at 11 PM contained only his unfinished sketches and canvases, checked by security on exit.' },
      e10: { type: 'Digital', title: 'Curator on camera at 2:05 AM', text: 'The hallway camera shows Farah Sheikh entering the main hall at 2:05 AM. She claims she had gone home at midnight.' },
      e11: { type: 'Testimony', title: 'Staff overheard Farah', text: 'An assistant overheard Farah say last week: "If the gallery goes under, at least the insurance will cover it."' }
    },
    locations: [
      { id: 'l1', name: 'Alarm Control Panel', teaser: 'Logs of every arm and disarm event.', result: 'The event list is short. One entry at 2:07 AM is highlighted in red.', clues: ['e1'] },
      { id: 'l2', name: 'Main Hall Skylight', teaser: 'The only other possible entry point.', result: 'You climb the ladder and inspect the latch and frame under a torch.', clues: ['e2'] },
      { id: 'l3', name: 'Empty Frame Wall', teaser: 'Where Monsoon at Dusk hung until tonight.', result: 'You examine the bare wall, the hooks and the area around the nail holes up close.', clues: ['e5'] },
      { id: 'l4', name: 'Curator\'s Office', teaser: 'Paperwork, insurance folders and unopened mail.', result: 'In a half-open drawer you find an insurance file and a thick envelope marked "Final Notice".', clues: ['e3', 'e4'] },
      { id: 'l5', name: 'Hallway CCTV Footage', teaser: 'The only camera that was recording.', result: 'You scrub to 2:00 AM and watch closely as a figure crosses into the main hall.', clues: ['e10'] }
    ],
    suspects: [
      {
        id: 's1', name: 'Farah Sheikh', role: 'Gallery Curator', bio: 'Founded the gallery twelve years ago. Elegant, well connected and quietly under pressure. Says she went home at midnight.',
        questions: [
          { id: 'q1', q: 'When did you leave the gallery?', a: '"Right at midnight. I was exhausted after the opening. My driver can confirm."', clues: [] },
          { id: 'q2', q: 'Why was the insurance increased last month?', a: '"The painting\'s market value had risen. Any responsible curator would do the same."', clues: [] },
          { id: 'q3', q: 'How is the gallery financially?', a: '"We are doing wonderfully. This opening was our best yet."', clues: [] }
        ]
      },
      {
        id: 's2', name: 'Vikram Rao', role: 'Artist', bio: 'The painter of Monsoon at Dusk. Brilliant, volatile and loudly unhappy with the gallery\'s contract.',
        questions: [
          { id: 'q1', q: 'Are you angry with the gallery?', a: '"Furious. They owe me six lakh in royalties. I told them I would sue - I never said I would steal my own painting."', clues: ['e8'] },
          { id: 'q2', q: 'What was in the crate you carried out at 11 PM?', a: '"My own old sketches. Security opened it. Ask them."', clues: ['e9'] },
          { id: 'q3', q: 'Did you see anyone near the main hall later?', a: '"I was long gone. I heard about the theft in the morning."', clues: [] }
        ]
      },
      {
        id: 's3', name: 'Tanvi Bose', role: 'Insurance Agent', bio: 'Sold the gallery its policy. Stands to lose commission if the claim is large - or to gain if it is not paid.',
        questions: [
          { id: 'q1', q: 'When did you leave the opening?', a: '"Just after one. I took a cab to my hotel and checked in around 1:25. I have both receipts."', clues: ['e7'] },
          { id: 'q2', q: 'Did the curator ask for more cover?', a: '"She did, last month. She was quite insistent and the process was unusually fast."', clues: [] },
          { id: 'q3', q: 'Do you benefit from this claim?', a: '"Not at all - a Rs. 4 crore payout will hurt my firm, not help me."', clues: [] }
        ]
      },
      {
        id: 's4', name: 'Harsh Trivedi', role: 'Head of Security', bio: 'Former police inspector. Knows the alarm system inside out. Was on duty all night.',
        questions: [
          { id: 'q1', q: 'Where were you at 2 AM?', a: '"Locked inside the security room by the cleaning contractor by mistake. I phoned him at 2:00 to get me out."', clues: ['e6'] },
          { id: 'q2', q: 'Was your alarm code used tonight?', a: '"No. Check the log - mine was never entered."', clues: [] },
          { id: 'q3', q: 'Any talk among the staff lately?', a: '"Mostly gossip. One assistant told me she heard Madam Farah say that if the gallery went under, at least the insurance would cover it. The skylight, by the way, is painted shut and covered in years of dust."', clues: ['e11'] }
        ]
      }
    ],
    methods: ['Smash-and-grab through the skylight', 'Staged theft using an insider alarm override', 'Swapped it for a forgery at the party', 'Smuggled it out in an exhibit crate'],
    motives: ['Revenge over unpaid royalties', 'Insurance payout to clear debts', 'Professional jealousy', 'Selling to a private collector'],
    solution: {
      suspect: 's1', method: 'Staged theft using an insider alarm override', motive: 'Insurance payout to clear debts',
      explain: 'Farah was drowning in a Rs. 1.2 crore debt. She doubled the insurance a month earlier, returned at 2:05 AM, disarmed the alarm with her own code from the inside, and removed the painting carefully. The untouched skylight, the clean nail holes and her unlisted visit on camera prove it was staged by an insider - the one person with the code and the motive. Harsh and Tanvi have solid alibis, and Vikram\'s crate held only sketches.'
    },
    hints: [
      'The skylight is covered in dust. So the thief did not come from outside - think about who has the alarm code.',
      'Check whose code disarmed the alarm and then see who has a reason to want a big insurance payout.',
      'Three suspects have an alibi or a cleared item. Compare the lender notice, the policy change and the 2:05 AM camera clip.'
    ]
  }
];
