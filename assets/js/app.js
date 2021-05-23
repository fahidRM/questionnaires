angular.module("questionnaire-page", [
    'app.pages'
]);

angular.module('app.pages', [])
    .controller(
        'QuestionnairePage', [ '$scope', function ($scope) {



            let vm =  this;
            vm.currentPage =  0;
            vm.data = {
                demographics: {
                    age: "",
                    education: "",
                    gender: "",
                    occupation: ""
                },
                responses: {
                    a: {
                        a: "",
                        b: "",
                        c: "",
                        d: "",
                        e: "",
                        f: ""
                    },
                    b: {
                        a: "",
                        b: "",
                        c: "",
                        d: "",
                        e: "",
                        f: ""
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
                fs =  firebase.firestore().collection('q2d1');
                fc =  firebase.firestore().collection('q2dc');
            }

            vm.gotoNextPage = function () {
                vm.currentPage ++;
            }

            vm.gotoPrevPage = function () {
                vm.currentPage --;
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


