/**
 * File: src/legacy/master-lab/mockMasterLab.ts
 * Description: The Master Lab (app/lab/master): one post about metacognition with a large, deeply branching discussion.
 */
import { MINUTE, toObservation, toVotedComments, type VotedSeed } from './mockLabPeople';

// Ten top branches, some with up to six replies, so "more", side replies and the colour cascade all get exercised.
const METACOGNITION_DISCUSSION: VotedSeed[] = [
  // Hana: it can be trained
  ['a', null, 'hana', 6, 31, "Short answer: yes, it can be trained. The trick is making your thinking visible. Predict how well you'll do, then compare it with how you actually did."],
  ['a1', 'a', 'kwame', 15, 18, "We tried that before exams. I was sure I'd get 80% and got 55%. Humbling."],
  ['a1a', 'a1', 'hana', 22, 16, 'That gap is the useful part. People who keep tracking it get noticeably better at predicting.'],
  ['a1a1', 'a1a', 'kwame', 30, 9, "So the skill isn't knowing more, it's knowing what I don't know?"],
  ['a1a1a', 'a1a1', 'hana', 36, 12, 'Exactly. Calibration first, knowledge follows.'],
  ['a1a1a1', 'a1a1a', 'grace', 48, 10, "Same in forecasting. The best forecasters aren't the ones who know most, they're the ones whose 70% really means 70%."],
  ['a1a1a1a', 'a1a1a1', 'kwame', 61, 7, 'How would I even check my 70%?'],
  ['a1a1a1a1', 'a1a1a1a', 'grace', 70, 9, 'Keep a list of predictions with a confidence number. After a month, see how often the 70% ones came true.'],
  ['a1a1a1a1a', 'a1a1a1a1', 'kwame', 150, 6, 'Started a note on my phone. Three predictions so far, all about my own exams.'],
  ['a1a1a1a2', 'a1a1a1a', 'hana', 74, 5, 'Or simpler: before a test, write down the score you expect. That single number is a start.'],
  ['a1a1a2', 'a1a1a', 'dan', 52, 3, 'Calibration sounds like a fancy word for being less sure of yourself.'],
  ['a1a1a2a', 'a1a1a2', 'hana', 58, 8, 'Not less sure. Accurately sure. Sometimes that means more confident, not less.'],
  ['a1a2', 'a1a', 'sarah', 40, 6, 'We do this in class with confidence cards. Students hold up how sure they are before we reveal the answer.'],
  ['a1b', 'a1', 'sarah', 19, 14, 'Rereading notes feels like learning. Testing yourself actually is. Most students pick the one that feels good.'],
  ['a1b1', 'a1b', 'ruth', 41, 11, "Forty years of teaching, and 'how did you get that answer?' did more than any worksheet."],
  ['a1b1a', 'a1b1', 'sarah', 55, 9, 'Stealing that question for tomorrow.'],
  ['a1b1b', 'a1b1', 'nina', 66, 7, 'It works because it turns the student into the examiner of their own reasoning.'],
  ['a1b2', 'a1b', 'kwame', 47, 7, 'Flashcards felt slower, but I remembered far more. Annoying.'],
  ['a1b2a', 'a1b2', 'hana', 53, 8, 'That slowness is the point. Effortful recall is what makes memories stick.'],
  ['a1b3', 'a1b', 'grace', 63, 4, "Spaced repetition apps do the testing for you, but they can't tell you why you got something wrong."],
  ['a1c', 'a1', 'michalku', 25, 5, 'Architecture students overrate their drawings the same way. The crit is where the gap shows.'],
  ['a2', 'a', 'dan', 12, 10, "Isn't this just a posh word for overthinking?"],
  ['a2a', 'a2', 'hana', 18, 15, 'Overthinking loops on the same worry. Metacognition notices the loop and decides what to do next.'],
  ['a2a1', 'a2a', 'dan', 27, 8, 'Fair. The noticing is the hard part.'],
  ['a2a1a', 'a2a1', 'ellie', 55, 9, "A two-line journal at the end of the day helps me notice. What went well, what I'd do differently."],
  ['a2a1a1', 'a2a1a', 'lucia', 68, 11, 'That is close to what therapists teach. Write the thought down and it stops filling the whole room.'],
  ['a2a1a1a', 'a2a1a1', 'dan', 80, 6, 'Tried it last night. It looked a lot less scary on paper.'],
  ['a2a1b', 'a2a1', 'priya', 60, 4, 'On night shifts I notice it around 4am. Everything feels like a disaster until the sun comes up.'],
  ['a2a2', 'a2a', 'lucia', 34, 12, "Rumination asks 'why is this happening to me'. Metacognition asks 'what is my mind doing right now'."],
  ['a2a2a', 'a2a2', 'dan', 45, 7, 'That distinction actually helps.'],
  ['a2b', 'a2', 'priya', 33, 6, 'In a hospital, overthinking and double-checking are very different things.'],
  ['a2b1', 'a2b', 'farah', 49, 8, 'Same on a labour ward. Double-checking has a checklist. Overthinking has no end.'],
  ['a2c', 'a2', 'nina', 71, 5, 'Philosophers have been accused of overthinking for 2,500 years. We call it a job.'],
  ['a3', 'a', 'michalku', 60, 5, 'Architects call it a design review. Explaining your decisions to someone else exposes the weak ones.'],
  ['a3a', 'a3', 'pavel', 76, 6, 'Carpenters say measure twice, cut once. Same idea, cheaper words.'],
  ['a3a1', 'a3a', 'michalku', 88, 7, 'Better words, honestly.'],
  ['a4', 'a', 'sam', 95, 3, "I predict I'll forget all of this by Friday."],
  ['a4a', 'a4', 'hana', 101, 6, "Then you're already better calibrated than most."],
  ['a5', 'a', 'yuki', 110, 4, 'Does this work for skills too, not just facts?'],
  ['a5a', 'a5', 'hana', 118, 7, 'Yes. Musicians and athletes use the same trick: predict how it will go, perform, then compare.'],
  ['a6', 'a', 'leo', 130, 2, 'My dog has zero metacognition and seems very happy.'],
  ['a6a', 'a6', 'lucia', 136, 5, "Dogs don't lie awake replaying conversations either. Swings and roundabouts."],

  // Zara: aviation made it a routine
  ['b', null, 'zara', 9, 24, "Aviation turned it into a routine. Before every approach we brief what could go wrong and how we'd notice it."],
  ['b1', 'b', 'tom', 25, 12, 'We have nothing like that on the buses. Might steal it.'],
  ['b1a', 'b1', 'zara', 31, 10, 'Start with one question: what am I assuming right now that could be wrong?'],
  ['b1a1', 'b1a', 'tom', 90, 6, "Asked myself that at a junction today and spotted the cyclist I'd assumed wasn't there."],
  ['b1a1a', 'b1a1', 'zara', 104, 8, "That's exactly it. The question is cheap, the cyclist isn't."],
  ['b1b', 'b1', 'igor', 44, 11, 'Air traffic control has the same habit. We read back every instruction, so a mistake has somewhere to show up.'],
  ['b1b1', 'b1b', 'tom', 57, 5, 'Read back. Like repeating a delivery address to the customer.'],
  ['b1b1a', 'b1b1', 'igor', 65, 6, 'Exactly that. Say it back, and the error gets a chance to be heard.'],
  ['b1b2', 'b1b', 'ben', 72, 7, "Fire crews do it on the radio too. Nobody trusts a message that wasn't repeated."],
  ['b2', 'b', 'priya', 21, 17, "Hospitals borrowed the same idea. At handover we say out loud what we're unsure about."],
  ['b2a', 'b2', 'nadia', 29, 11, "And anyone can stop and ask. The most useful sentence in healthcare is 'I'm not sure, let me check.'"],
  ['b2a1', 'b2a', 'priya', 38, 8, 'Took me years to say it without feeling stupid.'],
  ['b2a1a', 'b2a1', 'farah', 62, 9, 'The best senior midwife I worked with said it ten times a shift. It gave the rest of us permission.'],
  ['b2a1a1', 'b2a1a', 'priya', 70, 6, 'Permission is the right word. That culture comes from the top.'],
  ['b2a2', 'b2a', 'aisha', 52, 5, 'Kitchens with a no-blame culture report problems early. The others hide them.'],
  ['b2a2a', 'b2a2', 'marek', 67, 7, 'True. In the worst kitchen I worked in, nobody admitted burning anything. We served it anyway.'],
  ['b2b', 'b2', 'igor', 47, 9, "Aviation calls it a just culture. Honest mistakes get reported and learned from; reckless ones don't get excused."],
  ['b2b1', 'b2b', 'dan', 58, 4, "Where's the line between honest and reckless?"],
  ['b2b1a', 'b2b1', 'igor', 66, 8, 'Roughly: did you slip, or did you knowingly take a risk? The first gets training, the second gets consequences.'],
  ['b3', 'b', 'omar', 83, 6, 'Referees have a pre-match briefing too. Which players, which rivalries, which decisions will be hard.'],
  ['b3a', 'b3', 'zara', 92, 5, "Same principle. Decide how you'll notice trouble before you're in it."],
  ['b4', 'b', 'kwame', 99, 3, 'Is there a checklist for exams?'],
  ['b4a', 'b4', 'sarah', 106, 6, 'Read the question twice, underline what it asks, then check you answered that. Sounds silly, works.'],

  // Lucía: therapy is mostly this
  ['f', null, 'lucia', 11, 22, 'Therapy is mostly this. Learning that a thought is something your mind produced, not a fact about the world.'],
  ['f1', 'f', 'ben', 24, 9, 'Easier said than done at 3am.'],
  ['f1a', 'f1', 'lucia', 30, 12, "Always. That's why you practise it at 3pm, when it's easy, so it's there at 3am."],
  ['f1a1', 'f1a', 'ben', 42, 8, 'Like fire drills. Nobody learns where the exits are during the fire.'],
  ['f1a1a', 'f1a1', 'lucia', 49, 10, 'Perfect comparison. I might borrow it.'],
  ['f2', 'f', 'ellie', 28, 11, "I teach clients to add 'I'm having the thought that…' in front. It creates a little distance."],
  ['f2a', 'f2', 'dan', 37, 6, "I'm having the thought that this is nonsense."],
  ['f2a1', 'f2a', 'ellie', 43, 9, 'See, it works already.'],
  ['f2b', 'f2', 'farah', 51, 5, 'I use it with anxious parents on the ward. It calms the room more than reassurance does.'],
  ['f3', 'f', 'nina', 33, 7, "The Stoics said something similar: it isn't events that upset us, but our judgements about them."],
  ['f3a', 'f3', 'lucia', 46, 8, 'And modern therapy put it to the test. Cognitive therapy grew partly out of that idea.'],
  ['f4', 'f', 'kwame', 59, 3, 'Is this the same as mindfulness?'],
  ['f4a', 'f4', 'lucia', 67, 7, 'Related. Mindfulness trains the noticing; metacognition also asks what to do with what you notice.'],
  ['f5', 'f', 'tom', 81, 2, 'My thoughts are mostly about lunch.'],

  // Viktor: chess, every move
  ['c', null, 'viktor', 14, 20, 'Chess players train it every move: before you play, ask what your move allows your opponent to do.'],
  ['c1', 'c', 'mei', 28, 13, 'Programmers call it rubber duck debugging. Explain your code out loud and the bug often reveals itself.'],
  ['c1a', 'c1', 'sam', 45, 7, 'I explain my route to my dog every morning. Now I know why it works.'],
  ['c1a1', 'c1a', 'leo', 53, 6, 'Professional dog listener here. They are excellent at this.'],
  ['c1b', 'c1', 'mei', 39, 9, 'Pair programming does it too. Having to justify every line makes you notice your own shortcuts.'],
  ['c1b1', 'c1b', 'viktor', 58, 6, 'Same with a training partner. A blunder becomes obvious the moment you have to explain the move.'],
  ['c1b2', 'c1b', 'grace', 64, 8, 'Code review is the slow version. Writing the description is often where I find my own bug.'],
  ['c1b2a', 'c1b2', 'mei', 73, 7, 'Same. Half my bugs die in the description box.'],
  ['c1c', 'c1', 'nina', 50, 5, "Teaching is the ultimate rubber duck. You don't understand something until you've tried to explain it."],
  ['c2', 'c', 'marek', 70, 8, 'Tasting as you cook is the kitchen version. I check my own work fifty times a service.'],
  ['c2a', 'c2', 'aisha', 84, 5, 'With a clean spoon each time, please.'],
  ['c2a1', 'c2a', 'marek', 90, 9, 'Every time. Mostly.'],
  ['c3', 'c', 'yuki', 32, 12, "Musicians call it the recording test. What you hear while playing is never what the audience hears."],
  ['c3a', 'c3', 'viktor', 41, 9, 'Chess players write their candidate moves down before choosing. It exposes the lazy ones.'],
  ['c3a1', 'c3a', 'yuki', 56, 6, 'That is scary. Most of my lazy choices happen silently.'],
  ['c3b', 'c3', 'omar', 60, 7, 'Referees watch their own match footage. You remember a perfect game and the video disagrees.'],
  ['c4', 'c', 'kwame', 77, 4, 'Do chess engines make players worse at this, when the answer is always one click away?'],
  ['c4a', 'c4', 'viktor', 85, 10, 'Only if you look first. Guess the best move, then check. Looking first teaches nothing.'],
  ['c4a1', 'c4a', 'mei', 94, 8, 'That is the same advice Hana gave about AI. Predict, then check.'],
  ['c4a1a', 'c4a1', 'hana', 102, 9, 'It is the same trick everywhere. The prediction is where the learning happens.'],

  // Mei: does AI make it worse
  ['d', null, 'mei', 20, 16, "My worry: when AI answers instantly, I skip the moment where I notice I don't actually understand."],
  ['d1', 'd', 'hana', 26, 14, "A real risk. Try predicting the answer before you ask. If you can't, that is worth knowing."],
  ['d1a', 'd1', 'mei', 120, 7, 'Tried it on a bug today. I was wrong, and learned more from being wrong.'],
  ['d1b', 'd1', 'grace', 88, 9, "I do it with data. I guess what the chart will show before I plot it. When I'm surprised, that's the interesting part."],
  ['d2', 'd', 'leo', 44, 4, 'Or ask it to explain why, not just what.'],
  ['d2a', 'd2', 'mei', 52, 6, 'Asking why helps, but it can explain a wrong answer very convincingly.'],
  ['d2a1', 'd2a', 'nina', 60, 8, "Which is why 'how would I know if this is wrong?' matters more than ever."],
  ['d3', 'd', 'sarah', 35, 11, 'Teachers already see it. The homework is perfect, and the test shows nobody understood it.'],
  ['d3a', 'd3', 'ruth', 47, 7, 'We had the same problem with copied homework. The tool changed, the gap did not.'],
  ['d3b', 'd3', 'kwame', 54, 5, 'Guilty. Although I did learn to ask it better questions.'],
  ['d3b1', 'd3b', 'sarah', 63, 6, "That's a real skill, as long as you check the answers."],

  // Farah: knowing when the plan stopped fitting
  ['g', null, 'farah', 16, 14, 'In birth rooms the hardest skill is noticing when your plan has stopped fitting the situation.'],
  ['g1', 'g', 'priya', 34, 9, 'Sounds like what pilots call plan continuation bias.'],
  ['g1a', 'g1', 'zara', 45, 12, "It's real. We call it get-there-itis. You're so set on landing that you explain away every sign you shouldn't."],
  ['g1a1', 'g1a', 'farah', 57, 8, 'That is it exactly. The birth plan becomes the destination.'],
  ['g1a1a', 'g1a1', 'zara', 69, 9, 'We fix it with decision points agreed in advance. If this has not happened by then, we go around. No debate.'],
  ['g1a1a1', 'g1a1a', 'farah', 78, 7, "We're writing those into our ward guidelines now."],
  ['g1b', 'g1', 'igor', 62, 6, "Controllers hear it from pilots every week. The weather is closing in and they want 'just one more try'."],
  ['g2', 'g', 'ruth', 48, 5, 'Teachers have it with lesson plans. The class is lost and you keep going because it is page four.'],
  ['g2a', 'g2', 'sarah', 55, 8, 'Every Friday afternoon.'],
  ['g3', 'g', 'michalku', 86, 4, 'Projects too. The budget has doubled and we still defend the original design.'],

  // Nina: Socrates
  ['h', null, 'nina', 23, 11, "The oldest version of this is Socrates: the wise person knows what they don't know."],
  ['h1', 'h', 'dan', 39, 5, "Didn't that end badly for him?"],
  ['h1a', 'h1', 'nina', 44, 9, 'Very. Asking people to question their own certainty has never been popular.'],
  ['h2', 'h', 'grace', 58, 7, "In data science we'd call it knowing your error bars."],
  ['h2a', 'h2', 'nina', 66, 6, 'I like that. Error bars for opinions.'],
  ['h2a1', 'h2a', 'grace', 75, 8, 'Imagine if every comment here showed how sure its author was.'],
  ['h2a1a', 'h2a1', 'hana', 84, 10, 'That is a genuinely good product idea. Confidence shown next to claims.'],
  ['h2a1a1', 'h2a1a', 'michalku', 96, 7, 'Noted for the blueprint.'],

  // Omar: certainty is not evidence
  ['i', null, 'omar', 10, 9, 'Referees review every decision on video after a match. Most of my wrong calls felt completely certain at the time.'],
  ['i1', 'i', 'yuki', 35, 6, "Certainty isn't evidence. That's a hard lesson."],
  ['i2', 'i', 'viktor', 43, 8, 'Chess players call that the obvious move. It is the one to double-check.'],
  ['i2a', 'i2', 'omar', 54, 5, 'Obvious to me, and obvious to the player who dived. That is the problem.'],

  // Ben: no time to think in a fire
  ['j', null, 'ben', 27, 8, "In a fire there's no time to think about thinking. It has to be trained until it's automatic."],
  ['j1', 'j', 'zara', 51, 7, "Same in a cockpit emergency. The checklist does the thinking you can't do under stress."],
  ['j1a', 'j1', 'ben', 60, 6, 'Exactly. The reflection happens in training and in the debrief, never in the moment.'],
  ['j2', 'j', 'hana', 64, 5, 'Stress narrows attention. That is why practising the noticing while calm matters.'],

  // Jana: how do you know you're good at it
  ['e', null, 'jana', 40, 6, "Honest question: how do you know if you're any good at it?"],
  ['e1', 'e', 'ruth', 65, 7, 'When you change your mind for a good reason, and can say what the reason was.'],
  ['e2', 'e', 'lucia', 75, 9, "When you catch yourself mid-sentence and say 'actually, I'm not sure about that'."],
  ['e2a', 'e2', 'jana', 82, 4, 'I do that constantly. I thought it meant I was indecisive.'],
  ['e2a1', 'e2a', 'lucia', 91, 7, 'Indecisive is not deciding. Noticing the uncertainty and deciding anyway is the skill.'],
  ['e3', 'e', 'igor', 97, 5, 'When your mistakes stop surprising you. You saw them coming.'],
];

export function getMasterDiscussion() {
  const observation = toObservation(
    'master-metacognition',
    'michalku',
    Date.now() - 300 * MINUTE,
    'Islington',
    'Metacognition: thinking about your own thinking. Can we actually train it, or do we only notice our mistakes afterwards?'
  );

  return { observation, ...toVotedComments(observation, METACOGNITION_DISCUSSION) };
}
