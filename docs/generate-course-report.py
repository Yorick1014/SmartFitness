"""Regenerate the course report using screenshots under output/playwright."""
from pathlib import Path
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.utils import ImageReader

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/pdf/SmartFitness-Course-Application-Report.pdf'
OUT.parent.mkdir(parents=True,exist_ok=True)
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleSF',fontName='Helvetica-Bold',fontSize=30,leading=34,textColor=HexColor('#20273f'),spaceAfter=18))
styles.add(ParagraphStyle(name='HeadingSF',fontName='Helvetica-Bold',fontSize=19,leading=24,textColor=HexColor('#20273f'),spaceAfter=13))
styles.add(ParagraphStyle(name='SubSF',fontName='Helvetica-Bold',fontSize=12,leading=16,textColor=HexColor('#414194'),spaceBefore=12,spaceAfter=5))
styles.add(ParagraphStyle(name='BodySF',fontName='Helvetica',fontSize=10.5,leading=15,textColor=HexColor('#29334b'),spaceAfter=9))
styles.add(ParagraphStyle(name='CaptionSF',fontName='Helvetica',fontSize=9,leading=12,textColor=HexColor('#626b80'),spaceAfter=12))
styles.add(ParagraphStyle(name='KickerSF',fontName='Helvetica-Bold',fontSize=10,leading=15,textColor=HexColor('#6262df'),spaceAfter=12))
story=[]
def p(t,style='BodySF'):story.append(Paragraph(t,styles[style]))
def h(t):p(t,'SubSF')
def page(n,title):
 if story:story.append(PageBreak())
 p('CS3483  /  COURSE APPLICATION  /  '+str(n).zfill(2),'KickerSF');p(title,'HeadingSF')
def shot(name,caption,width=493):
 path=ROOT/'output/playwright'/name
 w,h=ImageReader(str(path)).getSize()
 story.append(Image(str(path),width=width,height=width*h/w))
 story.append(Spacer(1,7));p(caption,'CaptionSF')
def table(rows,widths):
 data=[[Paragraph(str(c),styles['CaptionSF']) for c in row] for row in rows]
 t=Table(data,colWidths=widths,hAlign='LEFT');t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),HexColor('#eeeeff')),('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,-1),.4,HexColor('#e0e3ed')),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),5)]));story.append(t)

page(1,'SmartFitness')
p('Applying interface design theory<br/>to a desktop fitness prototype','TitleSF')
p('Project design implementation report  |  6 November 2026','CaptionSF')
h('User community and context')
p('The proposal identifies students, home exercisers and beginners as primary users. They need exercise guidance and a manageable training record, without extensive manual counting. Intermittent users may forget their previous plan; experienced users want quick repeat sessions. During floor exercises, looking at the screen is inconvenient. These needs motivate recognition aids, large workout controls and optional spoken feedback. [P, pp. 1-3]')
h('Design decision')
p('Two layouts were considered analytically for this refinement. An all-in-one dashboard would expose selection, settings, preview and statistics together, but would increase competing information during exercise. The retained staged layout separates planning from performance and review. It gives the workout preview most of the window and reveals the set log only when requested. This is a reasoned design choice, not a result of participant testing. [L3, pp. 34, 37, 42]')
table([['Stage','Main action and next screen'],['Library / details','Recognize an exercise, inspect instructions, then open setup.'],['Setup','Enter or reuse a plan; validate it before starting.'],['Workout / rest','Follow remaining reps and set status; pause, resume or review.'],['Summary / history','Save the result to history, or discard it. Settings remain separate.']],[115,378])
h('Scope and evidence')
p('This report documents working interface changes applied to the existing React prototype. Screenshots show the running app with demonstration data. Camera tracking and speech recognition remain simulated; actual speech synthesis is optional. Existing supporting features are explicitly identified. This is a course-application supplement, not a complete group submission with member responsibilities.')

page(2,'Recognition and visual organization')
shot('course-library.png','Figure 1. Existing library structure retained: recent shortcuts, familiar exercise names, grouped filters and consistent cards.')
h('Course concepts')
p('L2 distinguishes limited short-term memory from recognition, and introduces Gestalt proximity and similarity. L3 calls for consistent terminology and reduced memory load. Recently used exercises and favourites externalize choices; repeated card layouts make equivalent actions easy to locate. Exercise details are available without placing all instructions on the library screen. [L2, pp. 32-34, 49, 52; L3, pp. 31, 34, 42]')
h('What changed in this pass')
p('The result count now exposes a polite status update for assistive technology after filtering. Favourite controls have a minimum 44-pixel hit area. Secondary text uses a darker shared colour. The existing Radix filter menus, including their trigger gap, selection indicator and keyboard support, are preserved from the preceding dropdown improvement.')
h('Intended effect')
p('Users can recognize a movement or previous choice instead of remembering an exact name. Grouping narrows attention to selection before training. These are design hypotheses; quicker selection and better retention have not yet been measured.')
p('Implementation: Library.jsx, FilterSelect.jsx and styles.css.','CaptionSF')

page(3,'Prevent mistakes before training')
shot('course-setup.png','Figure 2. Updated setup groups related fields and displays the complete plan before the user begins.')
h('New: explicit validation and recovery')
p('Sets accept whole numbers 1-20; reps per set 1-100; rest 0-600 seconds. Optional load accepts 0-1000 kg in 0.5 kg steps. Submitting an invalid plan keeps the user on setup, identifies the permitted range beside the field and focuses the first invalid input. Errors are associated with inputs through accessible descriptions and invalid state. No silent clamping is used as the user-facing correction. [L3, p. 38; L4, pp. 24-28]')
h('New: recognition and informative feedback')
p('The compact plan preview shows sets, reps per set, total reps and rest. For example, 2 sets of 2 reps shows 4 total reps. When history exists, Use last plan copies the previous planned sets, rep target, rest interval and first load; it preserves the current counting preference. Users can edit these values before starting. [L2, p. 52; L3, pp. 36, 41-42]')
p('The screenshot contains an earlier sample session. Last-session statistics describe that record; the highlighted preview describes the current editable plan. Implementation: Setup.jsx and domain/plan.js.','CaptionSF')

page(4,'Reduce effort during the workout')
shot('course-rest.png','Figure 3. Existing immersive workout and rest view, refined with larger, separated controls and semantic status feedback.')
h('New: target size and direct keyboard access')
p('Workout dock buttons now have a minimum height of 44 pixels, with 12-pixel gaps on desktop and extra separation before End. Fitts\' law relates movement time to distance and target size; larger targets are a course-based way to reduce precision demands. The 44-pixel value is an implementation choice, not a numeric requirement stated by the lecture. [L4, pp. 45-47]')
p('Space now pauses or resumes the workout when focus is on the page. The shortcut ignores repeated key events, editable fields, focused buttons, dropdown triggers, readiness countdowns and open dialogs. This makes the advertised shortcut work without hijacking typing or normal button activation. [L3, p. 35; L4, p. 45]')
h('New: status that carries meaning')
p('A named progress bar describes repetition progress. A polite live status announces the current set, repetitions remaining, rest transition or paused state. It supplies context rather than announcing an isolated number. Existing large visual counters and rest overlays remain the primary visible feedback. [L3, p. 36]')
p('Implementation: Workout.jsx and styles.css. Countdown and repetition values are generated by the demonstration session engine.','CaptionSF')

page(5,'Keep interruptions predictable')
shot('course-dialog.png','Figure 4. Updated End confirmation uses a native modal dialog and freezes the active session while a decision is pending.')
h('New: safe modal behavior')
p('Both End and navigation confirmations use the shared native dialog component. Opening a modal contains keyboard focus and makes the background inert. The safe Continue action appears first. Escape cancels; closing restores focus to the triggering control. A session that was running pauses while confirmation is open, then resumes on cancellation. A session that was already paused stays paused. [L3, pp. 38, 40-41; L4, p. 31]')
h('Why this matters')
p('The earlier visual overlays declared themselves modal but did not contain focus. Their session could keep counting behind the question. The refinement aligns visible state, available actions and the clock: users can make a decision without losing progress or accumulating unseen activity.')
h('Reversal has a defined boundary')
p('Cancelling a pending End action is reversible. End & review leads to a summary, where Save and Discard are explicit. A final discard still has no undo facility; this report does not claim universal undo. New page headings receive programmatic focus after screen changes, helping keyboard users find the new context. [L3, pp. 37, 40]')
p('Implementation: Dialog.jsx, App.jsx and Workout.jsx.','CaptionSF')

page(6,'Complementary modalities and closure')
shot('course-summary.png','Figure 5. Existing green completion tick and summary retained; the user explicitly saves or discards the demonstrated session.')
h('Match the channel to the task')
p('Visual output carries the preview, remaining reps, set progress, rest and completion. Existing browser speech synthesis can announce remaining reps, rest, pause and completion when enabled in Settings. This supports users whose gaze moves away from the screen, particularly in squats and push-ups. Visual feedback remains available when audio is unsuitable. Mouse and keyboard are functional input channels; pose input and spoken commands are not implemented. [L2, pp. 2, 54; P, pp. 2-3]')
h('Usability for different needs')
p('New semantic status updates, explicit field errors and modal keyboard behavior supplement existing speech volume, skeleton visibility, visible focus and reduced-motion handling. Reduced-motion styling also suppresses transitions. These changes support universal usability, but no screen-reader study or accessibility conformance audit has been completed. [L3, pp. 32-35]')
h('A beginning, middle and end')
p('Setup establishes the plan, workout/rest tracks progress, and summary provides closure before history. The green tick and separate statistics are existing features consistent with the course principle of completion feedback. They are not presented as newly added functionality. [L3, pp. 36-37]')

page(7,'Verification and course references')
h('Checks completed on 6 November 2026')
table([['Check','Observed evidence'],['Automated domain tests','17 passed, 0 failed: 14 existing tests and 3 new plan tests, including boundary values, invalid inputs and legacy plan reuse.'],['Production build','Vite build completed. Radix dependencies emitted ignored use-client directive warnings; no build failure.'],['Browser interaction','Invalid sets blocked start and received focus. Plan reuse restored 2 sets and 2 reps. Space toggled pause.'],['Modal behavior','Clock stayed unchanged during a 3.2-second confirmation. Focus remained inside; Escape restored trigger focus. Previously paused sessions stayed paused. Navigation cancellation resumed a running session.'],['Layout and filters','Four workout controls measured 44 pixels high. Shoulder filter returned 2 cards. Library had no horizontal overflow at a 390-pixel viewport. Screenshots captured at 1221 x 800.'],['Runtime console','No browser console errors observed in the checked flow. Actual speech playback and assistive-technology announcements were not audited.']],[115,378])
h('Evaluation still required')
p('L2 proposes learnability, performance speed, error rate, retention and subjective satisfaction as interface goals. A suitable next study would ask representative beginners and returning users to choose an exercise, correct a plan error, pause during rest, cancel End and save a session. Record completion rate, time, mistaken actions, recovery and satisfaction. No participant results or measured improvements are claimed here. [L2, pp. 7-9]')
h('References - supplied course material')
p('[L2] <i>L2 Human Factors.pdf</i>: pp. 2, 7-9, 32-34, 49, 52, 54.<br/>[L3] <i>L3 Priciples.pdf</i> (original filename): pp. 31-38, 40-42.<br/>[L4] <i>L4 Guidelines.pdf</i>: pp. 24-28, 31, 45-47.<br/>[P] <i>project_proposal.pdf</i>: pp. 1-3, SmartFitness project proposal, Monday 21:30 Group 2. All page references use 1-based PDF page positions. Course terminology is paraphrased; screenshots are from the implemented local prototype.','CaptionSF')
p('Reproducibility: npm test; npm run build. Report source: docs/generate-course-report.py. Native modal behavior depends on a browser supporting HTML dialog. Production camera inference, spoken command recognition and real exercise accuracy remain future work.','CaptionSF')

def footer(canvas,doc):
 canvas.saveState(); w,h=doc.pagesize
 canvas.setStrokeColor(HexColor('#e0e3ed'));canvas.line(50,43,w-50,43)
 canvas.setFillColor(HexColor('#626b80'));canvas.setFont('Helvetica',8)
 canvas.drawString(50,29,'SmartFitness  |  CS3483 Multimodal Interface Design')
 canvas.drawRightString(w-50,29,str(doc.page));canvas.restoreState()
doc=SimpleDocTemplate(str(OUT),pagesize=(595.28,841.89),rightMargin=51,leftMargin=51,topMargin=44,bottomMargin=56,title='SmartFitness - Applying CS3483 Interface Design',author='SmartFitness Project',subject='Course-grounded interface refinements and implementation evidence')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(OUT)
