# Kardashev Zero: Initial Design

Oct 19, 2026 · @Jeff Pyles

## Vision and goals

Players guide intelligent species from the equivalent of the Paleolithic to the colonization of the Solar System, and they invent every technology themselves. There is no designer-built tech tree. A player proposes an invention, an AI game master (the DM) judges it against the world's real physics and the player's existing material culture, and accepted inventions become buildable items in the game.

**Working title: Kardashev Zero.** The Kardashev scale signals the scale of the whole climb and the possibility of maxing it out. Zero is where every species begins, roughly, and reaching K = 0 is the first early-game milestone.

- **Train inventors:** the core skill the game exercises is real invention: understanding mechanisms, materials and constraints, and iterating on failure.
- **Produce real value:** a shared record of player inventions, some of them genuinely novel, with paths for promising ideas to reach real-world development.
- **Sandbox real futures:** at the frontier of real knowledge, flagship worlds become large-scale simulations of possible futures for human expansion into space, material and social.
- **Many worlds:** Earth and other plausibly life-bearing worlds such as Enceladus and Titan. Each world's environment drives what can be invented there, training invention under different conditions.

## Genre and core loop

The game combines 4X strategy (explore, expand, exploit, exterminate) with Factorio-style production chains and logistics. Invention replaces the tech tree: the production chain an invention needs is the proof that a society can actually make it.

The loop: explore the world and run experiments to learn its properties, pitch an invention, receive a ruling and refine it, build the production chain it requires, use the new capability to expand and reach new materials and knowledge, then invent again. Social technology runs alongside as a second sandbox, shaping how a society cooperates, teaches, trades and fights.

&#91;embedded content: core loop · 5 steps, 1 refine loop\]

The ruling is the gate: failures and examiner questions loop back to the pitch, and only accepted designs reach the production layer.

## The invention mechanic

Players propose inventions as structured pitches, like a patent claim, with free text inside each field. The balance to strike: claims plausible and explained well enough to show real understanding of the mechanism, without being punishing to write.

| Field | What the player states |
| --- | --- |
| What it does | Its function in the game |
| What it's made of | Materials the society has or can get |
| How it's made | Process steps, tools, energy, conditions |
| Why it works | The physical, chemical or social principle |

- **Graded outcomes, not pass or fail:** a roughly right but imperfect design still exists, with performance the world model calculates. A first kiln might reach 600 °C instead of 1,100 °C. Players improve numbers they can see.
- **Examiner questions:** instead of rejecting, the DM asks one or two pointed questions, like a patent office action. Answering well demonstrates understanding.
- **Fast, real feedback:** failures name the actual flaw quickly ("this binder goes brittle at 0 °C"). The explanation is where the learning happens.
- **Known tech is cheaper to claim:** well-documented inventions like a bow drill need only a rough description; genuinely novel ones need a fuller mechanism.
- **Rigor as a setting:** a casual mode that accepts plausible gist, and a strict mode for players who want to be pushed.
- **Every accepted invention becomes a recipe:** inputs, machine, time and energy, set by the DM and slotted into the production layer.

## The AI DM and the world model

The DM interprets and explains; a deterministic world model decides what is physically possible. Charming the DM must never be a way around physics.

- **World model:** materials and their properties, temperatures, pressures, available energy sources and basic chemistry rules for each world, fixed per world or per seed.
- **DM as interpreter and mentor:** translates a pitch into the world model's terms, checks it, sets costs, and explains failures.
- **Case law:** every ruling is stored. Similar pitches get consistent rulings, and players can cite precedent or appeal.
- **Experiments as gameplay:** on alien worlds especially, players are not handed property tables. They run experiments ("what happens to this rock in vent water?") to discover their world's physics.
- **Balance through reality:** costs scale with impact, prerequisites must exist in the society's material culture, and the production chain is the gate.

**Cost and abuse (to design later):** the DM must be economically viable and unusable as a free general-purpose chatbot or coding agent. Ideas so far:

- Structured pitches with length limits, and a DM that only returns rulings in a fixed format.
- Invention attempts cost in-game time and research points, so AI calls scale with play rather than spam.
- Shared rulings: once something is ruled on, later uses are cheap or free.
- Cheaper models for routine checks, larger ones for genuinely new pitches.
- Paying through subscriptions or players' own API keys.

## Production and scale-up

Most playtime will be industrial build-out, not invention: developing the screw is one thing, building the processes and supply chains that make endless screws cheaply is most of civilization. This side is fully deterministic, so it costs no AI calls.

- **Process inventions versus optimization:** a new process (like the Bessemer process for steel) goes through the DM. Arranging, balancing and scaling existing processes is pure simulation.
- **Rewarded achievements:** process inventions, efficient factory layouts and blueprints, and standardized units are tangible, rewarded things in the game.
- **Learning curves:** each recipe follows Wright's law, with unit cost falling by a fixed percentage every time cumulative production doubles, so the thousandth screw is cheaper than the first.
- **Division of labor:** early production is people, not machines, so specialization, skill, teaching and morale set productivity (Adam Smith's pin factory). Automation gradually replaces muscle, linking the industrial and social sides.
- **Precision as a resource:** standard threads, accurate lathes and true flat reference surfaces (Whitworth's three-plate lapping) form a progression of machine tools that make better machine tools. Tolerance flows down every production chain.
- **Item quality:** purity, strength and tolerance propagate through chains, so a poor smelter caps what a forge can make.
- **Logistics as infrastructure:** carrying and trails, then boats, roads, rail, pipelines and orbital transfers; on Enceladus, currents and vertical transport between ice and floor.
- **Real costs:** maintenance, wear, depletion of good deposits, pollution and environmental feedback, and disease in dense settlements.
- **Blueprints as shared knowledge:** shareable production layouts beside the patent office, and the raw material for bootstrap leaderboards.
- **Zoom levels:** tile-by-tile building early, shifting to regions, planets and supply lines between worlds at scale, as in Dyson Sphere Program and Factorio's Space Age expansion (also a precedent for planet-specific resources and recipes).

## Worlds

Each world's physical and chemical environment determines what can be invented there, so tech paths diverge naturally. A species' senses also shape how its world is perceived and mapped.

- **Canonical worlds:** as true to reality as we can make them, updated as real science changes. Inventions made here carry the most real-world weight, so the patent office records which world and settings each was invented under.
- **Seeded variants:** unknown parameters (such as an alien core's composition) are fixed differently per game, for replayability and to train invention under uncertainty.

| World | Defining conditions | What it pushes players toward | Path to space |
| --- | --- | --- | --- |
| Earth | Fire, air, metals, sight | Stone, fire, smelting, forging | Hardest gravity well: about 8 km/s to orbit |
| Enceladus | Dark ocean under 5 to 35 km of ice; vents; 1% gravity; no fire; sound, chemistry and electric senses | Knapped chert, grown carbonate, glass fiber, electroplating, bred toolmakers; map revealed by sonar and chemical trails | The ice is the challenge; from the surface, escape is about 240 m/s |
| Titan | Dense atmosphere, low gravity, methane seas, extreme cold, no oxygen | Flight is easy; exotic chemistry; no fire | Easy flight, but a cold, oxygen-free industrial base |

Enceladus and Titan both orbit Saturn, so their species would likely meet each other long before anyone from Earth arrives.

### Species starting conditions

Humans start as a band of about 30. Other species need not share human social structures, so each starts with its own profile, balanced through playtesting rather than theory, with social traits kept as adjustable parameters.

- **Enceladans:** if octopus-like socially as well as physically, largely solitary but bound by long-range song. Strengths: long lives, strong individual learning, deep experience. Weaknesses: hard cooperation and slow knowledge transfer, so specialization comes late. The first institution that gets solitary thinkers to cooperate is their agricultural revolution.
- **Different energy baselines:** a cold-water species with a slow metabolism starts much further below K = 0 than humans. Kardashev stays absolute, since it's physics; fair comparisons may need milestones relative to each species' start, or simply different difficulties.

## Social technology

Player-invented social arrangements are a goal, available from the first settlement, but unproven. If fair adjudication proves too hard, the fallback is baked-in social structures. To be explored once a basic physical world model and game structure work.

- **Mechanism:** an agent-based simulation of people with needs, relationships, reputations, beliefs and knowledge. A social invention is a set of rule changes (who shares with whom, how disputes are settled, who teaches whom, how marriages create alliances). The DM translates the player's description into rules; the simulation shows the consequences over time.
- **Grounding:** limits on group size and face-to-face trust, enforcement costs, how far information travels; reciprocity, reputation, punishment, costly signals and ritual; Elinor Ostrom's work on managing shared resources; hunter-gatherer institutions such as sharing norms, leveling mechanisms, gift-exchange networks and Aboriginal songlines.
- **Scale:** levels of detail. People near players and key figures are simulated as individuals; the rest as aggregate groups, promoted to individuals when they start to matter. On large servers, real players carry much of the social load and fewer simulated people are needed.
- **Transparent, adjustable assumptions:** world settings such as baseline trust, kin favoritism, how much people discount the future, and conformity. Mainline worlds use a research-based default, and every result is recorded with its settings.
- **Cautions:** results are "plausible under these assumptions," with the reasons visible. Assumptions about human nature carry political weight, so the mechanisms stay simple, open and adjustable.
- **Test first:** a standalone toy band simulation, with a few norms to change, to check it's fun and believable.

## Player role, multiplayer and game modes

In single player the player is a guiding intelligence, as in most 4X and Factorio games. In multiplayer, players lead within their societies, Warcraft or StarCraft style, so ownership, trade, law and conflict between players are real.

- **Layered roles:** early on, each player leads a band. As societies grow, players hold roles in institutions they've built together (chief, trader, teacher, priest). The wider population is simulated people whose loyalty and cooperation must be earned.
- **Precedents:** EVE Online's player-driven economy and politics; A Tale in the Desert, where players proposed and voted on laws that changed the game's rules.
- **Servers as social experiments:** servers developing along different social arrangements can be compared. The valuable part is real players' choices, closer to an economics lab experiment; outcomes driven mainly by simulated people would only reflect our assumptions.
- **Several scoreboards:** wellbeing, resilience, freedom, inequality, surviving hard times, and speed, not only the race to the Moon, which would reward crash programs that burn their populations.
- **Modes, Minecraft style:** suggested single-player goals (land on the Moon, found a Mars colony), open sandboxes, private worlds, and large multiplayer worlds, all orbiting long-running flagship worlds where the Solar System is gradually colonized.
- **Multi-species servers:** players starting on several worlds at equal tech levels, racing, allying and competing across the Solar System.

## Progression and pacing

Skilled players compressing history is a feature, not an exploit. A knowledgeable human in the Paleolithic really could jump-start civilization, and players may find novel but plausible shortcuts the real history missed.

**The Kardashev gauge.** A society's total energy throughput, shown as a Kardashev number, is the headline measure on its dashboard and a basis for win conditions. Using Carl Sagan's formula, K = (log₁₀ P − 6) / 10 with P in watts:

| Milestone | Power | K |
| --- | --- | --- |
| Starting band of 30 humans (metabolism, about 100 W each) | about 3 kW | about −0.25 |
| Kardashev Zero, the first milestone | 1 MW | 0 |
| Humanity today | about 2 × 10¹³ W | about 0.73 |
| Type I, planetary scale | 10¹⁶ W | 1 |

K = 0 equals about 10,000 people on metabolism alone. If fuel counts too (a forager burning a kilogram or two of wood a day adds a few hundred watts each), it falls to a few thousand people, about the scale of the earliest towns such as Çatalhöyük. Open question: exactly what counts toward the total (food, fuel, draft animals, everything after).

- **What still constrains a speedrun:** food surplus, labor and population; finding good ore or clay; tacit knowledge, since the player knows how to make bronze but the people must learn it (teaching and practice as resources); scale-up and maintenance.
- **Bootstrap leaderboards:** races for the shortest verified path from bare hands to industry. This mirrors a real, unsolved problem: bootstrapping industry on the Moon or Mars from a minimal starting kit.
- **Time compression:** early eras run faster per hour of play, slowing as societies grow complex.
- **Late joiners on persistent worlds:** start as uncontacted peoples or on other worlds, join an established civilization as colonists or explorers, or wait for a new era, when a flagship world restarts while keeping its history and patent records.
- **The frontier:** canonical worlds should reach present-day tech fairly quickly, and then the most interesting play begins. Past current knowledge the DM is weakest, so frontier tech uses success probabilities, tests that can fail, and possibly review by expert players or real researchers. Flagship worlds become wargames of real futures.
- **Interplanetary play:** real orbital mechanics and the cost of moving mass, as in Kerbal Space Program. Communication delays of minutes to Mars and over an hour to Saturn mean colonies can't be governed in real time, so they drift culturally and politically.
- **Interstellar play:** even at a few percent of light speed, Alpha Centauri is over a century away, so this becomes generation ships, long time spans and years-long message lags. Kardashev milestones and eventual contact with alien species (original designs, not borrowed from fiction) sit at the far end.

## AI as a faction

AI becomes playable at the appropriate point in each species' development, grounded by clear strengths and real constraints rather than raw superiority.

- **Strengths:** fast thinking, perfect memory, and the ability to copy itself.
- **Constraints:** it needs energy, chips and factories, so it depends on an industrial base; it needs robots or allies to act physically; it starts with no legitimacy among people.
- **Emergence from within:** AI can arise inside a player civilization. Whether it becomes partner, tool or rival depends on the governance that civilization invented for it, making AI governance a social technology players must work out.

## Patent office and real-world value

A shared patent office records every accepted invention across all players. Over time that record may become the most valuable thing the game produces.

- **Access:** the established library is available in private single-player worlds, for players who'd rather build than invent everything, and in large multiplayer worlds.
- **Rewards:** in-game credit for being first, and royalties when others use your tech in multiplayer.
- **Honest labels:** a DM ruling is not an experiment. Rulings carry confidence levels and are marked unverified, to avoid training false confidence. Novel ideas are exactly where an AI judge is least reliable.
- **Paths out:** promising inventions need a route to real testing and development, through partners, incubators or researchers, as Foldit's results went to real labs.
- **The Moon as flagship:** real data on regolith, solar power and resource extraction makes lunar tech the most likely place for play to feed real work.
- **Real-world IP (revisit near release; verify with a lawyer):** public disclosure can count as prior art and block a patent. The US allows a one-year grace period after an inventor's own disclosure; many countries allow almost none. Likely needs: private invention by default with opt-in sharing, timestamped proof of who invented what, terms stating the game doesn't own players' inventions, and an option to publish defensively as open technology.

## Safety and integrity

A game that rewards realistic invention will attract attempts to extract real recipes for dangerous things, so the DM abstracts hazardous chemistry and weapons: it grants the in-game effect without spelling out a real-world method.

- **Shared library moderation:** contributions to the patent office need checking for hazardous content before they are shared.
- **Honest framing of results:** social outcomes are labeled with their assumptions, and frontier rulings with their uncertainty, so the game isn't mistaken for proof that one social system or speculative technology works.

## Parked questions and next steps

- [ ] Design the DM's cost and abuse controls
- [ ] Explore and test the social simulation, once a basic physical world model and game structure work
- [ ] Revisit real-world IP before release, with legal advice
- [ ] Choose the first playable slice: which world, which view (cross-section or top-down), browser prototype or Claude Code project
- [ ] Define the world model's first scope: which materials, properties and processes it covers
- [ ] Decide how persistent flagship worlds handle time compression and late joiners
- [ ] Plan compute for simulated populations across many servers

* [ ] Check Kardashev Zero against existing games and trademarks
* [ ] Decide what counts toward a society's Kardashev number
* [ ] Design and playtest species starting conditions, beginning with Enceladans
