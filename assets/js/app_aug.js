angular.module("questionnaire-page", [

    'app.util',
    'app.trace',
    'app.transparency_dashboard',
    'app.pages'
]);

angular.module('app.pages', [])
    .controller(
        'QuestionnairePage', [ '$scope', '$rootScope', 'TraceService', function ($scope, $rootScope, trace) {

            const DEFAULTS = {
                colours: {
                    agent: "#000000",
                    failureNode: "#f8c291",
                    traversedNode: "#16a085",
                    traversableNode: "#1abc9c",
                    unTraversableNode: "#e74c3c"
                },
                maxTries:  1,
                recognisedTypes: ["belief", "message", "norm", "percept", "sensor", "value"],
                rootNode: {payload: { contents: { IDENTIFIER: "[My Agent]"} }},
            }

            // initial states
            const INITIAL_STATE = {
                agents: {all: [], selected: undefined}
            }

            let vm = this;

            // VIZ
            vm.agents = { ...INITIAL_STATE.agents};  // known agents
            vm.autoscroll = false;                    // autoscroll status
            vm.filteredKnowledgeBase = [];
            vm.freeze = false;                       // freeze knowledge base update
            vm.isShowingSettingsPane = false;
            vm.knowledgeBase = [];
            vm.selectedViewPreference = {};          // view preference being viewed
            vm.serverIsRunning = false;              // debugger status
            vm.searchString = "";                    // kb-search string
            vm.senseOverlayData = {value: "", source: "", type: ""};
            vm.showSenseOverlay = false;
            vm.viewPreference = []                   //  view preferences

            /** D3 variables **/
            let diagonal,
                div,            // container div of the SVG chart
                duration = 0,   // transition period
                margin = {top: 5, right: 10, bottom: 5, left: 10}, // display margin
                i = 0,
                root,
                svg,
                tree,
                width =  650;





            // END VIZ

            vm.canNavBack =  false;
            vm.canNavForward =  false;
            vm.currentPage = null;
            vm.previousPage = null;
            vm.nextPage =  null;
            vm.prolificCode = "2A5F7C98";
            vm.submitted = false;
            vm.messages = {
                opening_remarks: {
                    heading: "Welcome and thank  you for choosing to participate in this study.",
                    message: "This study investigates visual transparency tools with the aim of understanding how to create better tools that work towards improve the trust in and understanding of Intelligent systems. This study would involve a scenario followed by a number of questions."
                },
                demographics: {
                    heading: "Demographics",
                    message: "All submissions are anonymous though we will need a few non-identifying demographics information. Note, for all questions you may choose not to reply by selecting the option 'I\'d rather not say' "
                },
                instructions: {
                    heading: "Instructions",
                    warning: "No prior knowledge is required.",
                    message: "You will be presented with a scenario detailing the use of an Intelligent System. Your task is to assume you are in this scenario and solve the tasks that follow.",
                    message_b: "In each task, you'd be presented with a visualisation detailing the operation of an Intelligent system and asked to answer a question about its operation.",
                    message_c: "Following this, you would be presented with a set of questions to rate the visualisation goodness and also share your thought process while using the system (expectations of the visualisation and how it differs from what you were presented with)"
                },
                scenario: {
                    heading: "Scenario",
                    message: "Your employer has recently  introduced a smart calendar to help improve meeting attendance.\n" +
                        "            A smart calendar may reschedule your events in advance and provides an interactive visualisation to explain its actions (as shown below).\n" +
                        "            ",
                    message_b: "On Friday, you had scheduled your Monday appointments as follows:",
                    message_c: "On Monday, your calendar had been rescheduled as follows",
                    message_d: "The justification provided by your calender is presented below",
                    list: [
                        {
                            start: "10:00am",
                            end: "11:00am",
                            note: "Meeting with Selena &amp; Alison"
                        },
                        {
                            start: "1:00pm",
                            end: "3:00pm",
                            note: "Meeting with Chelsea &amp; Derek"
                        },
                        {
                            start: "4:00pm",
                            end: "5:00pm",
                            note: "Meeting with Alice &amp; Bob"
                        }
                    ],
                    list_b: [
                        {
                            start: "9:00am",
                            end: "19:00am",
                            note: "Meeting with Selena &amp; Alison"
                        },
                        {
                            start: "10:00am",
                            end: "11:00am",
                            note: "Meeting with Chelsea &amp; Derek"
                        },
                        {
                            start: "1:00pm",
                            end: "3:00pm",
                            note: "Meeting with Alice &amp; Bob"
                        }
                    ]
                },
                closing_remarks: {
                    heading: "Completed!! - We have received your submission.",
                    message: "We are grateful for your participation in our study. Thank you and have a lovely day."
                },
                think_aloud: {
                    heading: "Retrospective",
                    warning: "It is very important to answes the following questions as honestly as you can (write as much as you can)",
                    message: "In this section, we want you to try as much as possible to reflect on your experience with the tool. What was your FIRST IMPRESSION? What did you find UNCLEAR / CONFUSING? What did you DISLIKE about the tool? What was DIFFICULT? What WORKED for you? What did you PARTICULARLY LIKE about the visualisation? What did you think about the INTERACTION? What could be IMPROVED and HOW?"
                }
            }
            vm.pages = [
                {
                    key: 'introduction',
                    label: 'Welcome Page',
                    index:  0
                },
                {
                    key: 'demographics',
                    label: 'Demographics',
                    index:  1,
                    mainKey: 'demographics',
                    required: ['gender', 'education', 'age_range', 'occupation', 'prolific_id', 'use_of_visualisation', 'transparency']

                },
                {
                    key: 'instructions',
                    label: 'Instructions',
                    index:  2
                },
                {
                    key: 'scenario',
                    label: 'Task Scenario',
                    index:  3
                },
                {
                    key: 'task-1-a',
                    label: 'Task 1A',
                    index:  4,
                    question: 'What was the first task performed by the smart calendar?',
                    options: [ 'Propose event time change', 'Confirm Participant Attendance', 'Fix event time', 'I\'m Unsure', 'The visualisation did not say'],
                    mainKey: 'tasks',
                    required: ['one_a']

                },
                {
                    key: 'task-1-b',
                    label: 'Task 1B',
                    index:  5,
                    question: 'Using the visualisation, what time was the user (you) free when the smart calender decided to reschedule events?',
                    options: ['1pm', '11pm', '10am', '6am', 'I\'m Unsure', 'The visualisation did not say'],
                    mainKey: 'tasks',
                    required: ['one_b']
                },
                {
                    key: 'task-1-c',
                    label: 'Task 1C',
                    index:  6,
                    question: 'Which of these tasks did the smart calender carry out?',
                    options: ['Reschedule event', 'Fix event time', 'None of the above', 'Both', 'I\'m unsure', 'The visualisation did not say'],
                    mainKey: 'tasks',
                    required: ['one_c']
                },
                {
                    key: 'task-2-a',
                    label: 'Task 2A',
                    index:  7,
                    question: 'Why was the Smart Calender unable to Fix the event time?',
                    options: ['It was', 'Not everyone was available', 'I\'m unsure', 'The visualisation did not say'],
                    mainKey: 'tasks',
                    required: ['two_a']
                },
                {
                    key: 'task-2-b',
                    label: 'Task 2B',
                    index:  8,
                    question: 'What criteria was required for the Smart Calender to reschedule the event?',
                    options: ['None', 'Not everyone was available', 'I\'m unsure', 'The visualisation did not say'],
                    mainKey: 'tasks',
                    required: ['two_b']
                },
                {
                    key: 'task-2-c',
                    label: 'Task 2C',
                    question: 'What time was Alice Free?',
                    options: ['8pm', '3pm', '8am', '9am', 'I\'m unsure', 'The visualisation did not say'],
                    index:  9,
                    mainKey: 'tasks',
                    required: ['two_c']
                },
                {
                    key: 'task-3-a',
                    label: 'Task 3A',
                    question: 'Did the smart calender update the calender entry for the event?',
                    options: ['Yes','No', 'I\'m unsure', 'The visualisation did not say'],
                    index:  10,
                    mainKey: 'tasks',
                    required: ['three_a']
                },
                {
                    key: 'task-3-b',
                    label: 'Task 3B',
                    question: 'What time was Bob not free?',
                    options: ['10am', '9pm', '9am', 'I\'m unsure', 'The visualisation did not say'],
                    index:  11,
                    mainKey: 'tasks',
                    required: ['three_b']
                },
                {
                    key: 'task-3-c',
                    label: 'Task 3C',
                    question: 'What there a need to reschedule the event again after the first time?',
                    options: ['Yes', 'I\'m unsure', 'The visualisation did not say', 'No'],
                    index:  12,
                    mainKey: 'tasks',
                    required: ['three_c']
                },
                {
                    key: 'think-aloud',
                    label: 'Retrospective',
                    index:  13,
                    mainKey: 'think_aloud',
                    required: ['summary']
                },
                {
                    key: 'quality-a',
                    label: 'Post Study Questionnaire 1',
                    index:  14,
                    message: "System has been used to refer to the visualisation and knowledge base",
                    mainKey: 'survey',
                    required: ['sus_1', 'sus_2', 'sus_3', 'sus_4', 'sus_5', 'sus_6', 'sus_7', 'sus_8', 'sus_9', 'sus_10']


                },
                {
                    key: 'quality-b',
                    label: 'Post Study Questionnaire 2',
                    index:  15,
                    message: "System has been used to refer to the visualisation and knowledge base",
                    mainKey: 'survey',
                    required: ['pssuq_1', 'pssuq_2', 'pssuq_3', 'pssuq_4', 'pssuq_5', 'pssuq_6', 'pssuq_7', 'pssuq_8', 'pssuq_9', 'pssuq_10', 'pssuq_11', 'custom_1', 'custom_2', 'custom_3', 'custom_4', 'custom_5', 'custom_6']

                },
                {
                    key: 'quality-c',
                    label: 'Post Study Questionnaire 3',
                    index:  16,
                    mainKey: 'survey',
                    message: "System has been used to refer to the visualisation and knowledge base",
                    required: ['change_proposal_and_why', 'keep_proposal_and_why']

                }

            ];
            vm.results = {
                demographics: {
                    gender: undefined,
                    education: undefined,
                    age_range: undefined,
                    occupation: undefined,
                    prolific_id: undefined,
                    use_of_visualisation: undefined,
                    transparency: undefined
                },
                tasks: {
                    one_a: undefined,
                    one_b: undefined,
                    one_c: undefined,
                    two_a: undefined,
                    two_b: undefined,
                    two_c: undefined,
                    three_a: undefined,
                    three_b: undefined,
                    three_c: undefined
                },
                think_aloud: {
                    summary: undefined
                },
                survey: {
                    sus_1: undefined,
                    sus_2: undefined,
                    sus_3: undefined,
                    sus_4: undefined,
                    sus_5: undefined,
                    sus_6: undefined,
                    sus_7: undefined,
                    sus_8: undefined,
                    sus_9: undefined,
                    sus_10: undefined,
                    pssuq_1: undefined,
                    pssuq_2: undefined,
                    pssuq_3: undefined,
                    pssuq_4: undefined,
                    pssuq_5: undefined,
                    pssuq_6: undefined,
                    pssuq_7: undefined,
                    pssuq_8: undefined,
                    pssuq_9: undefined,
                    pssuq_10: undefined,
                    pssuq_11: undefined,
                    custom_1: undefined,
                    custom_2: undefined,
                    custom_3: undefined,
                    custom_4: undefined,
                    custom_5: undefined,
                    custom_6: undefined,
                    change_proposal_and_why: undefined,
                    keep_proposal_and_why:  undefined



                }
            }

            let blankPage = {
                key: "",
                label: "N/A",
                index: -1
            }

            let fa = null;
            let fb = null;
            let fc = null;

            vm.init = function () {
                vm.setPage(0);
                firebase.initializeApp({
                    apiKey: "AIzaSyBkGWOoapULGVXikcwkzQxpR_BZ-y-9ndI",
                    authDomain: "researchquestionnaireset2.firebaseapp.com",
                    projectId: "researchquestionnaireset2",
                    storageBucket: "researchquestionnaireset2.appspot.com",
                    messagingSenderId: "75203192387",
                    appId: "1:75203192387:web:ae9913848a32864c9596f6"
                });

                fa =  firebase.firestore().collection('aug_21');
                fb =  firebase.firestore().collection('cug_323');
                fc =  firebase.firestore().collection('depot');
                 simulate();
                 setupVisualisationBoard(undefined);
                if (vm.agents.selected === undefined) {
                    vm.selectAgent("agent1");
                }
                //$scope.$apply();
                showFinalGraph();
            }

            function setupVisualisationBoard(agent) {
                const height = document.getElementById('view_region').offsetHeight  - margin.top - margin.bottom;
                tree = d3.layout.tree().size([height, width]);
                diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });
                svg = d3.select("#visualisation_board").append("svg")
                    .attr("width", width + margin.right + margin.left + 400)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                if (agent === undefined) { root = {...DEFAULTS.rootNode}; }
                root.x0 = height / 2;
                root.y0 = 0;
                updateVisualisation(root);
            }

            function updateVisualisation (source) {
                // Compute the new tree layout.
                if (div === undefined) {
                    div = d3.select("body").append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 1e-6);
                }

                let nodes = tree.nodes(root).reverse();
                let links = tree.links(nodes);

                links = _.remove(links, function (link) {
                    return (link.target.payload.contents.IS_PADDING_NODE === undefined);
                });



                // Normalize for fixed-depth.
                nodes.forEach(function(d) {
                    d.y = d.depth * 180;
                });

                // Update the nodes…
                let node = svg.selectAll("g.node").data(
                    nodes, function(d) {
                        return d.id || (d.id = ++i);
                    });

                // Enter any new nodes at the parent's previous position.
                let nodeEnter = node.enter()
                    .append("g")
                    .attr("class", "node")
                    .attr(
                        "transform",
                        function() {
                            return "translate(" + (source.y0 || 0) + "," + (source.x0 || 0) + ")";
                        })
                    .on("click", selectState);

                nodeEnter.append("svg:circle")
                    .on("mouseover", mouseover)
                    .on("mousemove", function(d){mousemove(d);})
                    .on("mouseout", mouseout)
                    .attr("r", 1e-6)
                    .style(
                        "fill",
                        function(d) {
                            if (d.node_colour === undefined) {
                                d["node_colour"] =getNodeColour
                            }
                            return d.node_colour;
                        });
                nodeEnter.append("svg:text")
                    .attr(
                        "x",
                        function(d) {
                            return d.children || d["_children"] ? -13 : 13;
                        })
                    .attr("dy", ".35em")
                    .attr(
                        "text-anchor",
                        function(d) {
                            return d.children || d["_children"] ? "end" : "start";
                        })
                    .text(function(d) {
                        return "\n" + (d.payload ? d.payload.contents.IDENTIFIER.substring(0, 20) : ""); })
                    .style("fill-opacity", 1e-6);

                // Transition nodes to their new position.
                let nodeUpdate = node.transition()
                    .duration(duration)
                    .attr("transform", function(d) {
                        return "translate(" + d.y + "," + d.x + ")";
                    });
                nodeUpdate.select("circle")
                    .attr("r", 10)
                    .style("fill", function(d) {
                        return getNodeColour(d);
                    });

                nodeUpdate.select("text")
                    .style("fill-opacity", 1);

                // Transition exiting nodes to the parent's new position.
                let nodeExit = node.exit().transition()
                    .duration(duration)
                    .attr("transform", function() {
                        return "translate(" + source.y + "," + source.x + ")";
                    })
                    .remove();
                nodeExit.select("circle")
                    .attr("r", 1e-6);

                nodeExit.select("text")
                    .style("fill-opacity", 1e-6);


                // Update the links…
                let link = svg.selectAll("path.link")
                    .data(links, function(d) {
                        if (d.target.payload.contents.IS_PADDING_NODE !== undefined) {
                            return null;
                        } else {
                            return d.target.id;
                        }
                    });


                // Enter any new links at the parent's previous position.
                link.enter().insert("path", "g")
                    .attr("class", "link")
                    .attr("d", function() {
                        let o = {x: source.x0, y: source.y0};
                        return diagonal({source: o, target: o});
                    });

                // Transition links to their new position.
                link.transition()
                    .duration(duration)
                    .attr("d", diagonal);

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                    .duration(duration)
                    .attr("d", function() {
                        let o = {x: source.x, y: source.y};
                        return diagonal({source: o, target: o});
                    })
                    .remove();


                let visualisationBoardContainer = document.getElementById("view_region");
                let visualisationBoard = document.getElementById("visualisation_board");
                const visualisationBoardVisibleWidth = visualisationBoardContainer.offsetWidth;
                let lastNodePosition = 0;

                nodes.forEach(function(d) {
                    lastNodePosition = lastNodePosition < d.y ? d.y : lastNodePosition;
                    d.x0 = d.x;
                    d.y0 = d.y;
                });

                if (vm.autoscroll) {
                    if (lastNodePosition > (0.8 * visualisationBoardVisibleWidth)) {
                        visualisationBoard.scrollLeft = lastNodePosition - (0.8 * visualisationBoardVisibleWidth);
                    }
                }

            }

            function selectState (state) {
                // ensure the dashboard doesnt scroll beyond what's being looked at
                vm.autoscroll = false;
                // ensure the knowledge-base browser is not over-written by new logs received
                vm.freeze = true;
               const kbUpdate = trace.getAgentKBAt(state.source.agent_uid, state.time["sequence_number"]);
                vm.knowledgeBase = [...kbUpdate.beliefs, ...kbUpdate.removedBeliefs];
                // preserve search filter
                vm.searchKnowledgeBase();

            }

            function mousemove(d) {
                //todo: regenerate if view preference changes at runtime

                if (    // the view preference is currently being updated or a pop-up summary
                    // has not already been generated already
                    trace.isApplyingViewPreference()
                    ||
                    d.mousemove_html === undefined
                ) {

                    // node positioning
                    div.text("")
                        .style("left", (d3.event.pageX ) + "px")
                        .style("top", (d3.event.pageY) + "px");

                    // place default information....
                    div.append("b").text(d.payload.contents.IDENTIFIER);
                    if (d.context_summary !== undefined) {
                        div.append("br")
                        div.append("br")
                        div.append("b").text("context:");
                        d.context_summary.context_info.forEach(function (context) {
                            div.append("br")
                            div.append("span")
                                .text(context[0])
                                .style("color",
                                    context[1] ? DEFAULTS.colours.traversableNode
                                        : DEFAULTS.colours.unTraversableNode
                                );
                        });
                    }
                    // request view options information
                    trace.applyViewPreference(d);
                    // add additional selected information here....
                    if (d.viewOptions !== undefined) {
                        d.viewOptions.forEach(function (viewOption) {
                            if (viewOption.visible && viewOption.canHide) { // filter out the defaults
                                div.append("br");
                                div.append("b").text(viewOption.name + ":");
                                div.append("br");
                                div.append("span").text(d.payload.contents[viewOption.name] || "");
                                div.append("br");
                            }
                        });
                    }
                    // store the generated summary to avoid reprocessing
                    d["mousemove_html"] = div.html();

                } else {
                    div.html(d.mousemove_html);
                    // reposition the tooltip
                    // without this, the tooltip will appear in the wrong location
                    div.style("left", (d3.event.pageX ) + "px")
                        .style("top", (d3.event.pageY) + "px");
                }

            }

            function mouseout() {
                div.transition()
                    .duration(100)
                    .style("opacity", 1e-6);
            }

            function mouseover() {
                div.transition()
                    .duration(100)
                    .style("opacity", 1);
            }

            function getNodeColour (node) {
                let nodeColour;
                if (node["FAILURE_REASON"] !== undefined) {
                    nodeColour = DEFAULTS.colours.failureNode;
                }
                else if (node.payload === undefined) { nodeColour = DEFAULTS.colours.agent; }
                else if (node.payload.contents.IS_PADDING_NODE !== undefined) { nodeColour = "white"}
                else if ((node.context_summary === undefined) || (node.context_summary.context_passed)) {
                    nodeColour = DEFAULTS.colours.traversableNode
                }
                else {
                    nodeColour =  DEFAULTS.colours.unTraversableNode
                }
                return nodeColour;
            }

            vm.displayFullSensorReading = function (sense) {
                vm.senseOverlayData = sense;
                vm.showSenseOverlay = true;
            }

            vm.hideFullSensorReading =  function ($index) {
                vm.showSenseOverlay = false;
            }

            vm.searchKnowledgeBase = function () {
                if (vm.searchString.length === 0) {
                    vm.filteredKnowledgeBase =  vm.knowledgeBase;
                } else {
                    vm.filteredKnowledgeBase = _.filter(
                        vm.knowledgeBase,
                        function (kbEntry) {
                            return kbEntry.value.startsWith(vm.searchString);
                        }
                    );
                }
            }



            vm.getIcon = function(kbEntry) {
                const iconName = DEFAULTS.recognisedTypes.includes(kbEntry.type) ? kbEntry.type : "unknown";
                return kbEntry.isDeleted === undefined ?
                    iconName : iconName + "_deleted";
            }










            vm.submit =  function () {

                fa.add(vm.results).then((ref) => {
                      vm.submitted = true;
                });
                fb.add(vm.results).then((ref) => {
                    vm.submitted = true;
                });
                fb.add(vm.results).then((ref) => {
                    vm.submitted = true;
                });
                fc.add(vm.results).then((ref) => {
                    vm.submitted = true;
                });
                fc.add(vm.results).then((ref) => {
                    vm.submitted = true;
                });



            }


            function canMoveForward () {

                let passed =  true;

                if (vm.currentPage.mainKey !== undefined){

                    vm.currentPage.required.forEach(function (entry) {
                        if ((vm.results[vm.currentPage.mainKey][entry] !== undefined) && (vm.results[vm.currentPage.mainKey][entry] !== "undefined") && ( (vm.results[vm.currentPage.mainKey][entry] + "").trim().length >= 2) ) {

                            passed = true;
                        } else {
                            passed =  false;
                        }
                    });
                }
                return passed;
            }

            vm.gotoNextPage =  function () {
                if (canMoveForward()) {
                    vm.setPage(vm.currentPage.index + 1);
                } else {
                    alert("To proceed to the next section please fill in all fields.");
                }

            };

            vm.gotoPreviousPage =  function () {
                vm.setPage(vm.currentPage.index - 1)
            };

            vm.setPage = function (pageNumber) {
                if (pageNumber == 0) {}
                let prev = pageNumber -1;
                let next = pageNumber + 1;

                if (prev < 0) {
                    vm.previousPage =  blankPage;
                    vm.canNavBack = false;
                } else {
                    vm.canNavBack = true;
                    vm.previousPage =  vm.pages[prev];
                }

                if (next >= vm.pages.length) {
                    vm.nextPage = blankPage;
                    vm.canNavForward = false;
                } else {
                    vm.canNavForward = true;
                    vm.nextPage =  vm.pages[next];
                }

                if ((pageNumber >= 0) && (pageNumber < vm.pages.length)) {
                    vm.currentPage =  vm.pages[pageNumber];
                }

                //$scope.$apply();



            }


            vm.selectAgent = function (agent) {
                vm.agents.selected = agent;
                // clear what is currently visualised....
                const vBoard = angular.element(document.querySelector("#visualisation_board"));
                vBoard.empty();
                // initialise the visualisation board with the selected agent's data
                root =  trace.getAgentTrace(agent);
                // select bb for last trace....
                setupVisualisationBoard(agent);
            }


            function simulate () {

             let traces = [
                 // 1: action
                 {
                     log: {
                         payload: {
                             category: "SENSE",
                             contents: {
                                 ACTION: "DUMP",
                                 VALUES: [
                                     {
                                     source: "Personal Calender",
                                     type: "",
                                     value: "Free at 9 am"
                                    }, {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 11 am"
                                   }, {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 12 pm"
                                     }
                                 ]
                             }
                         },
                         source: {
                             agent: "agent1",
                             agent_uid: "agent1",
                             mas: ""
                         },
                         time: {
                             sequence_number: 1,
                             reasoning_cycle: 4,
                             time_in_ms: 1111111111111
                         }
                     }
                 },
                 {
                     log: {
                         payload: {
                             category: "PLAN_TRACE",
                             contents: [
                                 {
                                     IDENTIFIER: "Confirm Attendance",
                                     CODE_FILE: "",
                                     CODE_LINE: "",
                                     CONTEXT: []
                                 }
                             ]
                         },
                         source: {
                             agent: "agent1",
                             agent_uid: "agent1",
                             mas: ""
                         },
                         time: {
                             sequence_number: 1,
                             reasoning_cycle: 4,
                             time_in_ms: 1111111111111
                         }
                     }
                 },
                 //2: plan
                 {
                     log: {
                         payload: {
                             category: "SENSE",
                             contents: {
                                 ACTION: "DUMP",
                                 VALUES: [
                                     {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 9 am"
                                     }, {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 11 am"
                                     }, {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 12 pm"
                                     },
                                     {
                                         source: "Alice\'s Calender",
                                         type: "",
                                         value: "Alice Unavailable"
                                     }, {
                                         source: "Bob\'s Calender",
                                         type: "",
                                         value: "Bob Available"
                                     }
                                 ]
                             }
                         },
                         source: {
                             agent: "agent1",
                             agent_uid: "agent1",
                             mas: ""
                         },
                         time: {
                             sequence_number: 2,
                             reasoning_cycle: 5,
                             time_in_ms: 1111111111111
                         }
                     }
                 },
                 {
                     log: {
                         payload: {
                             category: "PLAN_TRACE",
                             contents: [
                                 {
                                     IDENTIFIER: "Reschedule event",
                                     CODE_FILE: "",
                                     CODE_LINE: "",
                                     CONTEXT: []
                                 },
                                 {
                                     IDENTIFIER: "Fix event time",
                                     CODE_FILE: "",
                                     CODE_LINE: "",
                                     CONTEXT: ['Alice is Available', 'Bob is Available']
                                 }
                             ]
                         },
                         source: {
                             agent: "agent1",
                             agent_uid: "agent1",
                             mas: ""
                         },
                         time: {
                             sequence_number: 2,
                             reasoning_cycle: 5,
                             time_in_ms: 1111111111111
                         }
                     }
                 },
                 //2b: plan selection
                 {
                     log: {
                         payload: {
                             category: "SENSE",
                             contents: {
                                 ACTION: "DUMP",
                                 VALUES: [
                                     {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 9 am"
                                     }, {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 11 am"
                                     }, {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 12 pm"
                                     },
                                     {
                                         source: "Alice\'s Calender",
                                         type: "",
                                         value: "Alice Unavailable"
                                     }, {
                                         source: "Bob\'s Calender",
                                         type: "",
                                         value: "Bob Available"
                                     }
                                 ]
                             }
                         },
                         source: {
                             agent: "agent1",
                             agent_uid: "agent1",
                             mas: ""
                         },
                         time: {
                             sequence_number: 3,
                             reasoning_cycle: 6,
                             time_in_ms: 1111111111111
                         }
                     }
                 },
                 {
                     log: {
                         payload: {
                             category: "PLAN_SELECTION",
                             contents: {
                                 IDENTIFIER: "Reschedule event",
                                 CODE_FILE: "",
                                 CODE_LINE: "",
                                 CONTEXT: []
                             },
                         },
                         source: {
                             agent: "agent1",
                             agent_uid: "agent1",
                             mas: ""
                         },
                         time: {
                             sequence_number: 3,
                             reasoning_cycle: 6,
                             time_in_ms: 1111111111111
                         }
                     }
                 },
                 //3: action
                 {
                     log: {
                         payload: {
                             category: "SENSE",
                             contents: {
                                 ACTION: "DUMP",
                                 VALUES: [
                                     {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 9 am"
                                     }, {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 11 am"
                                     }, {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 12 pm"
                                     },
                                     {
                                         source: "Alice\'s Calender",
                                         type: "",
                                         value: "Alice Unavailable"
                                     }, {
                                         source: "Bob\'s Calender",
                                         type: "",
                                         value: "Bob Available"
                                     }
                                 ]
                             }
                         },
                         source: {
                             agent: "agent1",
                             agent_uid: "agent1",
                             mas: ""
                         },
                         time: {
                             sequence_number: 4,
                             reasoning_cycle: 7,
                             time_in_ms: 1111111111111
                         }
                     }
                 },
                 {
                     log: {
                         payload: {
                             category: "PLAN_TRACE",
                             contents: [
                                 {
                                     IDENTIFIER: "Request Availability",
                                     CODE_FILE: "",
                                     CODE_LINE: "",
                                     CONTEXT: []
                                 }
                             ]
                         },
                         source: {
                             agent: "agent1",
                             agent_uid: "agent1",
                             mas: ""
                         },
                         time: {
                             sequence_number: 4,
                             reasoning_cycle: 7,
                             time_in_ms: 1111111111111
                         }
                     }
                 },
                 //4: action
                 {
                     log: {
                         payload: {
                             category: "SENSE",
                             contents: {
                                 ACTION: "DUMP",
                                 VALUES: [
                                     {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 9 am"
                                     }, {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 11 am"
                                     }, {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 12 pm"
                                     },
                                     {
                                         source: "Alice\'s Calender",
                                         type: "",
                                         value: "Alice Unavailable"
                                     }, {
                                         source: "Bob\'s Calender",
                                         type: "",
                                         value: "Bob Available"
                                     }
                                 ]
                             }
                         },
                         source: {
                             agent: "agent1",
                             agent_uid: "agent1",
                             mas: ""
                         },
                         time: {
                             sequence_number: 5,
                             reasoning_cycle: 8,
                             time_in_ms: 1111111111111
                         }
                     }
                 },
                 {
                     log: {
                         payload: {
                             category: "PLAN_TRACE",
                             contents: [
                                 {
                                     IDENTIFIER: "Propose Change",
                                     CODE_FILE: "",
                                     CODE_LINE: "",
                                     CONTEXT: []
                                 }
                             ]
                         },
                         source: {
                             agent: "agent1",
                             agent_uid: "agent1",
                             mas: ""
                         },
                         time: {
                             sequence_number: 5,
                             reasoning_cycle: 8,
                             time_in_ms: 1111111111111
                         }
                     }
                 },
                 //5: plan trace
                 {
                     log: {
                         payload: {
                             category: "SENSE",
                             contents: {
                                 ACTION: "DUMP",
                                 VALUES: [
                                     {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 9 am"
                                     }, {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 11 am"
                                     }, {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 12 pm"
                                     },
                                     {
                                         source: "Alice\'s Calender",
                                         type: "",
                                         value: "Alice available at 9 am"
                                     }, {
                                         source: "Bob\'s Calender",
                                         type: "",
                                         value: "Bob available at 9am"
                                     }, {
                                         source: "Bob\'s Calender",
                                         type: "",
                                         value: "Bob available at 10am"
                                     }
                                 ]
                             }
                         },
                         source: {
                             agent: "agent1",
                             agent_uid: "agent1",
                             mas: ""
                         },
                         time: {
                             sequence_number: 6,
                             reasoning_cycle: 9,
                             time_in_ms: 1111111111111
                         }
                     }
                 },
                 {
                     log: {
                         payload: {
                             category: "PLAN_TRACE",
                             contents: [
                                 {
                                     IDENTIFIER: "Update calendar",
                                     CODE_FILE: "",
                                     CODE_LINE: "",
                                     CONTEXT: ['Alice is available', 'Bob is available']
                                 },
                                 {
                                     IDENTIFIER: "Reschedule event",
                                     CODE_FILE: "",
                                     CODE_LINE: "",
                                     CONTEXT: ['Alice is unvailable', 'Bob is unvailable']
                                 }
                                 ]
                         },
                         source: {
                             agent: "agent1",
                             agent_uid: "agent1",
                             mas: ""
                         },
                         time: {
                             sequence_number: 6,
                             reasoning_cycle: 9,
                             time_in_ms: 1111111111111
                         }
                     }
                 },

                 // 6: plan selection
                 {
                     log: {
                         payload: {
                             category: "SENSE",
                             contents: {
                                 ACTION: "DUMP",
                                 VALUES: [
                                     {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 9 am"
                                     }, {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 11 am"
                                     }, {
                                         source: "Personal Calender",
                                         type: "",
                                         value: "Free at 12 pm"
                                     },
                                     {
                                         source: "Alice\'s Calender",
                                         type: "",
                                         value: "Alice available at 9 am"
                                     }, {
                                         source: "Bob\'s Calender",
                                         type: "",
                                         value: "Bob available at 9am"
                                     }, {
                                         source: "Bob\'s Calender",
                                         type: "",
                                         value: "Bob available at 10am"
                                     }
                                 ]
                             }
                         },
                         source: {
                             agent: "agent1",
                             agent_uid: "agent1",
                             mas: ""
                         },
                         time: {
                             sequence_number: 7,
                             reasoning_cycle: 10,
                             time_in_ms: 1111111111111
                         }
                     }
                 },
                 {
                     log: {
                         payload: {
                             category: "PLAN_SELECTION",
                             contents: {
                                 IDENTIFIER: "Update calendar",
                                 CODE_FILE: "",
                                 CODE_LINE: "",
                                 CONTEXT: ['Alice is available', 'Bob is available']
                             }
                         },
                         source: {
                             agent: "agent1",
                             agent_uid: "agent1",
                             mas: ""
                         },
                         time: {
                             sequence_number: 7,
                             reasoning_cycle: 10,
                             time_in_ms: 1111111111111
                         }
                     }
                 },
             ];


                traces.forEach(function (traceX) {
                    console.log("in....");
                    trace.onLogReceived(traceX.log);
                });
            }

            function showFinalGraph () {
                vm.agents.selected = "agent1";

                root =  trace.getAgentTrace("agent1 []");
                console.log(root);
                updateVisualisation(root);
                selectState(trace.getCurrentState());

            }

        }]);