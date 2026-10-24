export type Lesson = {
  id: string;
  topic: "diseases" | "vaccination" | "nutrition" | "hygiene" | "welfare" | "breeding";
  species: ("cattle" | "goat" | "sheep" | "poultry" | "fish")[];
  title: { en: string; ha: string };
  body: { en: string[]; ha: string[] };
};

// Draft educational content. Must be reviewed by a qualified veterinarian before publication.
export const lessons: Lesson[] = [
  {
    id: "fmd-signs",
    topic: "diseases",
    species: ["cattle", "goat", "sheep"],
    title: { en: "Common signs of Foot-and-Mouth Disease", ha: "Alamomin cutar Ƙafa da Baki" },
    body: {
      en: [
        "Look for blisters in the mouth, on the tongue, and between the hooves.",
        "Animals may drool a lot, limp, stop eating, or have a fever.",
        "Separate sick animals from the herd straight away.",
        "Call a veterinarian quickly. Do not move animals to markets while they are sick.",
      ],
      ha: [
        "Duba ƙuraje a baki, harshe, da tsakanin kofato.",
        "Dabbobi na iya yawan yawu, rame, daina ci, ko zazzaɓi.",
        "Ware dabbobin da ba su da lafiya daga garken nan take.",
        "Kira likitan dabbobi da wuri. Kada ka kai dabbobi kasuwa yayin da suke rashin lafiya.",
      ],
    },
  },
  {
    id: "newcastle",
    topic: "vaccination",
    species: ["poultry"],
    title: { en: "Protecting chickens from Newcastle disease", ha: "Kare kaji daga cutar Newcastle" },
    body: {
      en: [
        "Newcastle disease spreads fast and can kill many birds.",
        "Vaccinate on the schedule your vet recommends, and record each dose in Vetra.",
        "Keep vaccines cool and use them soon after mixing.",
        "Limit visitors and wash hands and boots before entering the coop.",
      ],
      ha: [
        "Cutar Newcastle tana yaɗuwa da sauri kuma tana iya kashe tsuntsaye da yawa.",
        "Yi allurar riga-kafi bisa jadawalin da likitanka ya ba da, ka rubuta kowace a Vetra.",
        "Ajiye maganin riga-kafi a wuri mai sanyi, ka yi amfani da shi bayan haɗawa.",
        "Rage baƙi, ka wanke hannu da takalma kafin shiga gidan kaji.",
      ],
    },
  },
  {
    id: "clean-water",
    topic: "nutrition",
    species: ["cattle", "goat", "sheep", "poultry"],
    title: { en: "Clean water every day", ha: "Ruwa mai tsabta kowace rana" },
    body: {
      en: [
        "Animals drink more in the hot season. Check water at least twice a day.",
        "Clean drinkers regularly to stop germs from growing.",
        "An animal that stops drinking may be sick — watch it closely.",
      ],
      ha: [
        "Dabbobi suna shan ruwa fiye da haka a lokacin zafi. Duba ruwa sau biyu a rana.",
        "Wanke kwanukan ruwa akai-akai don hana ƙwayoyin cuta.",
        "Dabbar da ta daina shan ruwa na iya zama ba ta da lafiya — ka kula da ita.",
      ],
    },
  },
  {
    id: "deworming",
    topic: "diseases",
    species: ["goat", "sheep", "cattle"],
    title: { en: "Why deworming matters", ha: "Muhimmancin maganin tsutsotsi" },
    body: {
      en: [
        "Worms make animals thin, weak, and slow to grow.",
        "Signs include pale eyelids, a rough coat, and diarrhoea.",
        "Ask your vet which dewormer and dose to use. Set a reminder in Vetra for the next dose.",
      ],
      ha: [
        "Tsutsotsi suna sa dabbobi su rame, su raunana, kuma su yi jinkirin girma.",
        "Alamomi sun haɗa da fararen fatar ido, gashi mara kyau, da gudawa.",
        "Tambayi likitanka maganin da adadin da za a yi amfani da shi. Saita tunatarwa a Vetra.",
      ],
    },
  },
  {
    id: "biosecurity",
    topic: "hygiene",
    species: ["poultry", "cattle", "goat", "sheep", "fish"],
    title: { en: "Simple farm biosecurity", ha: "Kariyar gona mai sauƙi" },
    body: {
      en: [
        "Keep new animals apart for 2–3 weeks before mixing them with your herd or flock.",
        "Place a foot bath with disinfectant at the entrance.",
        "Remove dead animals quickly and safely.",
      ],
      ha: [
        "Ware sababbin dabbobi na makonni 2–3 kafin haɗa su da garkenka.",
        "Sanya ruwan wanke ƙafa da maganin kashe ƙwayoyin cuta a ƙofar shiga.",
        "Cire matattun dabbobi da sauri kuma cikin aminci.",
      ],
    },
  },
  {
    id: "pond-water",
    topic: "welfare",
    species: ["fish"],
    title: { en: "Keeping pond water healthy", ha: "Kiyaye lafiyar ruwan tafki" },
    body: {
      en: [
        "Fish gasping at the surface can mean low oxygen.",
        "Do not overfeed — leftover feed spoils the water.",
        "Change part of the water regularly and remove dead fish promptly.",
      ],
      ha: [
        "Kifi masu numfashi a saman ruwa na iya nufin ƙarancin iska.",
        "Kada ka ba da abinci fiye da kima — ragowar abinci na lalata ruwa.",
        "Canja wani ɓangare na ruwa akai-akai, ka cire matattun kifi da sauri.",
      ],
    },
  },
];

export const topics = ["diseases", "vaccination", "nutrition", "hygiene", "welfare", "breeding"] as const;
