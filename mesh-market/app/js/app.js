
Vue.config.debug = true;


var protocol = {
                "app" : {
                    "offer" :
                    {
                        "explanation": "Make an Offer",
                        "recommendations": {},                                  
                        "upvotes": "",
                        "downvotes": "",
                        "units": {},
                        "children": [],
                    },
                    "find" :
                    {
                        "explanation" : "Find an Offer",
                        "recommendations": {},                                  
                        "upvotes" : "",
                        "downvotes" : "",
                        "units": {},
                        "children": [],
                    },
                    "address":
                    {
                        "explanation": "Your Public Key",
                        "recommendations": "",
                        "upvotes": "",
                        "downvotes": "",
                        "units": {},
                        "children": []
                    },
                    "password":
                    {
                        "explanation": "Your Private Key -- Don't Forget It!!",
                        "recommendations": "",
                        "upvotes": "",
                        "downvotes": "",
                        "units": {},
                        "children": []
                    },
                    "open-wallet":
                    {
                        "explanation": "Unlock an Existing Wallet",
                        "recommendations": "",
                        "upvotes": "",
                        "downvotes": "",
                        "units": {},
                        "children": []
                    },
                    "create-wallet":
                    {
                        "explanation": "Generate a New Wallet",
                        "recommendations": "",
                        "upvotes": "",
                        "downvotes": "",
                        "units": {},
                        "children": []
                    }                                                    
                },
                "tags" : {
                    "internet":
                    {
                        "explanation": "",
                        "recommendations": {},                                
                        "upvotes": "",
                        "downvotes": "",
                        "units": {"bandwidth": "bit/s",  "information": "bits"},
                        "children": ["wireless", "optical", "cables", "Wi-Fi"],
                    },
                    "wireless":
                    {
                        "explanation": "communications channel not requiring wires/cables",              
                        "recommendations": {"optical": "faster, reduce RF polution"},   
                        "upvotes": "",
                        "downvotes": "",
                        "units": {"bandwidth": "bit/s",  "information": "bits", "time": "minutes"},
                        "children": [],
                    },
                    "transportation":
                    {
                        "explanation": "",
                        "recommendations": "",
                        "upvotes": "",
                        "downvotes": "",
                        "units": {"distance": "kilometers", "time": "minutes"},
                        "children": ["delivery"]
                    },
                    "energy":
                    {
                        "explanation": "",
                        "recommendations": "",
                        "upvotes": "",
                        "downvotes": "",
                        "units": {"power": "kilowatt-hours", "time": "minutes"},
                        "children":
                        ["solar"]

                    },
                    "agriculture":
                    {
                        "explanation": "",
                        "recommendations": "",
                        "upvotes": "",
                        "downvotes": "",
                        "units": {},
                        "children": ["produce"]

                    },
                    "real-estate":
                    {
                        "explanation": "",
                        "recommendations": "",
                        "upvotes": "",
                        "downvotes": "",
                        "units": {"time": "days"},
                        "children": ["lease", "purchase"]
                    },
                    "lottery":
                    {                                               
                        "explanation": "",
                        "recommendations": "",
                        "upvotes": "",
                        "downvotes": "",
                        "units": {},
                        "children": []
                        
                    },
                    "althea":
                    {
                        "explanation" : "",
                        "recommendation": "",
                        "upvotes": "",
                        "downvotes": "",
                        "units": {"internet":"seconds"},
                        "children": []
                    }
                }
               };

var offerPromptList = ["Give your offer a name:",
                       "Add tags to your offer to make it easier to find:",
                       "How would you describe your offer?",
                      "Which currencies will you accept for your offer?",
                       "Give your offer a value:",                               
                       "Offer location(s):",                     
                       "When should your offer be valid?",
                       "Look good?"
                  ];


$(document).ready(function() {    


    Vue.component('conversion-row', {
        props: ['currency', 'val'],
        template: '<div class="row"><div class="col-xs-4">{{currency}}:</div><div class="col-xs-4"><input v-bind:id="currency" v-model="val" /></div><div class="col-xs-4"></div></div>'
        
    });

    Vue.component('news', {
        props: [],
        template: '<div class="row"></div>'


    });

   

    
    
    var vm = new Vue({
        el: '#site-container',
        mixins: [ VueFocus.mixin ],
        data: {
            offer: {
                name: '',
                value: '',
                perUnit: '',
                units: {},
                tags: '',
                description: '',
                currencies: [],
                locationStart: '',
                locationEnd: '',
                validFrom: '',
                validTo: '',
                values: {
                    BTC: '',
                    ETH: '',
                    USD: ''
                },
                destination: false,
            },
            user: {
                nickname: '',
                funds: {
                    BTC: '',
                    ETH: '',
                    USD: ''                    
                },
                location: ''               
                
            },
            offerShow: false,
            findShow: false,
            appShow: true,
            apiShow: false,
            protocolShow: false,
            walletShow: false,
            offerCount: 1,
            findCount: 1,
            protocol: protocol
            
        },             
        methods: {        
            makeOffer(e) {
                e.preventDefault();                
                console.log(this.offer.currencies);
             //   SimpleStorage.set(15);
             //   console.log(SimpleStorage.get());
            },
            findOffer(e) {
                e.preventDefault();                           
            },
            detailsClose(e) {
                e.preventDefault();
                this.offerShow = false;
                this.findShow = false;                
            },
            startApp(){
                this.appShow = true;
            },
            startProtocol(){
                this.protocolShow = true;
            },
            startOver(e){
                e.preventDefault();
                this.offer.name = '',
                this.offer.perUnit = '',
                this.offer.units = {},
                this.offer.tags = '',
                this.offer.description = '',
                this.offer.location = '',
                this.offer.validFrom = '',
                this.offer.validTo = '',
                this.offer.values.BTC = '',
                this.offer.values.USD = '',
                this.offer.values.ETH = '',
                this.offerCount = 1;
                this.offer.currencies = []
            },
            openWallet(){
                
            },
            createWallet(){
                
            },
            toggleDestination(){
                this.offer.destination = !this.offer.destination;
                
            },
        },
        computed: {
            offerPrompt: function(){
                return offerPromptList[this.offerCount-1];
                
            },
            flyingDistance: function(){
                
            },
            drivingDistance: function(){
            }
        },
        watch: {
            'offer.tags': {
                handler : function(){
                    try {
                        var tagList = this.offer.tags.split(',');
                        console.log(tagList);
                        
                        for(var i=0; i<tagList.length; i++){
                            console.log(tagList[i]);
                            try {
                                var unitsObj = this.protocol["tags"][tagList[i]]["units"];                        
                                var unitKeys = Object.keys(unitsObj);
                        
                                for (var i=0; i<unitKeys.length; i++){
  
                                    if (!unitsObj[unitKeys[i]]){
                                        console.log("updating units");
                                        // update dict only if it doesn't already contain key
                                        this.offer.units[unitKeys[i]] = unitsObj[unitKeys[i]];
                                    }
  
                                    this.offer.units[unitKeys[i]] = unitsObj[unitKeys[i]];
                                }
                                console.log(this.offer.units);
                            }                             
                            catch(e) {return true}
                        }
                    } catch(e) {return true}
                }    
            }
        }
        
    });

    // magicsuggest tags input

    
    var ms = $('#offer-tags').magicSuggest({
        placeholder: '',
        allowFreeEntries: false,
        resultAsString: true,
        data: Object.keys(protocol["tags"]),
        valueField: 'name'
    });

    $(ms).on(
        'selectionchange', function(e, cb, s){
            vm.offer.tags = cb.getValue().toString();            
        }
    );
    
    // date interval selector

    $( function() {
        var dateFormat = "mm/dd/yy",
            from = $( "#from" )
            .datepicker({
                defaultDate: "+1w",
                changeMonth: true,
                numberOfMonths: 3
            })
            .on( "change", function() {
                to.datepicker( "option", "minDate", getDate( this ) );
            }),
            to = $( "#to" ).datepicker({
                defaultDate: "+1w",
                changeMonth: true,
                numberOfMonths: 3
            })
            .on( "change", function() {
                from.datepicker( "option", "maxDate", getDate( this ) );
            });
        
        function getDate( element ) {
            var date;
            try {
                date = $.datepicker.parseDate( dateFormat, element.value );
            } catch( error ) {
                date = null;
            }
            
            return date;
        }
    } );
   
    // update protocol div
    
    function explain(element){
        var tag = element;
        console.log(tag);
        var explanation = protocol["app"][tag]["explanation"];
        $("#explanation").html('<transition name="fade">' + explanation + '</transition>');
    }

    $(".pro").hover(function(){
        explain(this.id);

    });

    $(".pro").mouseleave(function(){
        $("#explanation").text("Mesh Market");

    });

    // leaflet
    var map = L.map('map', { zoomControl:false });
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    var markers = new L.FeatureGroup();
    map.addLayer(markers);
    map.setView([0, 0], 2);

    $("#offer-location-start").geocomplete();
    $("#offer-location-end").geocomplete();

    map._handlers.forEach(function(handler) {
        handler.disable();

    });
    
});




