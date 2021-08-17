angular.module("questionnaire-page", [
    'app.pages'
]);

angular.module('app.pages', [])
    .controller(
        'QuestionnairePage', [ '$scope', function ($scope) {



            let vm =  this;
            vm.currentPage =  0;
            vm.currentQuestion = 0;
            vm.data = {
                demographics: {
                    age: "",
                    education: "",
                    gender: "",
                    occupation: "",
                    prolific: "",
                    use_of_visualisations : ""
                },
                responses: {
                    a: {
                        a: "",
                        a_res: "",
                        b: "",
                        b_res: "",
                        c: "",
                        c_res: "",
                        d: "",
                        d_res: "",
                        e: "",
                        e_res: "",
                        f: "",
                        f_res: ""
                    },
                    b: {
                        a: "",
                        a_res: "",
                        b: "",
                        b_res: "",
                        c: "",
                        c_res: "",
                        d: "",
                        d_res: "",
                        e: "",
                        e_res: "",
                        f: "",
                        f_res: ""
                    },
                }
            };
            vm.submitted =  false;
            let fs = ""
            let fc = ""





            vm.init =  function () {
                firebase.initializeApp({
                    apiKey: "AIzaSyBkGWOoapULGVXikcwkzQxpR_BZ-y-9ndI",
                    authDomain: "researchquestionnaireset2.firebaseapp.com",
                    projectId: "researchquestionnaireset2",
                    storageBucket: "researchquestionnaireset2.appspot.com",
                    messagingSenderId: "75203192387",
                    appId: "1:75203192387:web:ae9913848a32864c9596f6"
                });
                fs =  firebase.firestore().collection('july_21');
                fc =  firebase.firestore().collection('xpxpxp');
            }

            vm.gotoNextPage = function () {
                vm.currentPage ++;
                vm.currentQuestion = 0;
            }

            vm.gotoPrevPage = function () {
                vm.currentPage --;
                vm.currentQuestion = 0;
            }

            vm.gotoNextQuestion = function () {
                vm.currentQuestion ++;
                if (vm.currentPage == 2) {
                    if (vm.currentQuestion >= 6) {
                        vm.gotoNextPage();
                    }
                } else if (vm.currentPage == 3) {
                    if (vm.currentQuestion >= 7) {
                        alert("here");
                        //vm.gotoNextPage();
                    }
                }
            }

            vm.gotoPrevQuestion = function () {
                vm.currentQuestion --;
                if (vm.currentPage == 2 || vm.currentPage == 3) {
                    if (vm.currentQuestion <= 0) {
                        vm.gotoPrevPage();
                    }
                }
            }

            vm.submit =  function () {
                        fs.add(vm.data)
                        .then((ref) => {
                            vm.currentPage = -1;
                        });
                     fc.add(vm.data)
                    .then((ref) => {
                        vm.currentPage = -1;
                    });
                fc.add(vm.data)
                    .then((ref) => {
                        vm.currentPage = -1;
                    });
                vm.currentPage = -1;
            }





        }]
    )


