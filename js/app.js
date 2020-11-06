window.readJSON = function (fileName) {
    var request = new XMLHttpRequest();
    request.open("GET", "../" + fileName + ".json", false);
    request.send(null)
    var dataJson = JSON.parse(request.responseText);
    return dataJson;
}

window.domain = "today.line.me"

let articles = null;
let domains = null;
let urls = null;
var date = new Date();
var month = date.getMonth() + 1;
var today = date.getFullYear() + '/' + month + '/' + date.getDate();
window.chart = null;
window.indexChart = null;

let selectStartTime = ''

var cnt = 0;
window.removeWC = function(id) {
    if(cnt > 0) {
        document.getElementById(id).childNodes[0].remove()
    }
    cnt ++
}

var app = new Vue({
    el: '#app',
    components: {
        vuejsDatepicker
    },
    data: {
        article: {
            url: '',
            content: ''
        },
        searchResultData: {
            urlTFvalue: undefined,
            contentTFvalue: undefined,
            accTF: undefined
        },
        isSearchPopuped: false,
        errorMessage: null,
        // -----------------------------
        domains,
        urls,
        articles,
        stage: '3',
        startTime: '2018/1/1',
        endTime: today,
        zh: vdp_translation_zh.js,
        format: 'yyyy/MM/dd',
        classCheck: [],
        wordCloud: [],
        lineChartData: {
            columns: [],
            rows: []
        }
    },
    mounted() {
        if(document.getRootNode().documentURI == "http://127.0.0.1:5500/index.html" || document.getRootNode().documentURI == "https://fakenewstw.tk/index.html" || document.getRootNode().documentURI == "https://fakenewstw.tk/") {
            this.indexWordCloud()
        }else if(document.getRootNode().documentURI == "http://127.0.0.1:5500/report.html" || document.getRootNode().documentURI == "https://fakenewstw.tk/report.html") {
            this.getSnaAPI(window.domain)
        }
    },
    methods: {
        sendSearchData() {
            // this.mockResultSearchData();
            this.apiPost();
        },

        clearSearchResult() {
            this.isSearchPopuped = false;
            this.searchResultData = {
                urlTFvalue: undefined,
                contentTFvalue: undefined,
                accTF: undefined
            };
        },

        apiPost() {
            axios.post("https://140.124.93.123:8070/search", this.article)
                .then(response => {
                    var domainScore;
                    var articleScore;
                    var weightedScore;
                    
                    if(response.data.domain_score == undefined) {
                        domainScore = '－'
                    }else {
                        domainScore = response.data.domain_score
                    }

                    if(response.data.article_score == undefined) {
                        articleScore = '－'
                    }else {
                        articleScore = response.data.article_score
                    }

                    if(response.data.weighted_score == undefined) {
                        weightedScore = '－'
                    }else {
                        weightedScore = response.data.weighted_score
                    }

                    this.searchResultData = {
                        urlTFvalue: domainScore,
                        contentTFvalue: articleScore,
                        accTF: weightedScore
                    }
                })
                .catch(error => {
                    this.errorMessage = error.errorMessage
                    console.error("There was an error!", error)
                })
            this.isSearchPopuped = true;
        },

        setWordCloud(data, id) {
            // document.getElementById('wordcloud').childNodes[0].remove()
            anychart.onDocumentReady(function() {
                
                // create a tag (word) cloud chart
                window.indexChart = anychart.tagCloud(data);

                // set an array of angles at which the words will be laid out
                indexChart.angles([0])
                // enable a color range
                indexChart.colorRange(false);
                // set the color range length
                indexChart.colorRange().length('80%');

                indexChart.height('400px')
                indexChart.maxHeight('400px')
                
                // display the word cloud indexChart
                indexChart.container(id);
                
                indexChart.draw();

                setTimeout(window.removeWC(id), 100)
            });
        },

        indexWordCloud() {            
            const req = new Request('https://140.124.93.123:8070/word_cloud?start_time=2012/1/1&end_time=2019/1/1&cate=[1,2,3]')
            fetch(req)
                .then(res => res.json())
                .then(data => {
                    this.setWordCloud(data, 'indexWordcloud')
                    console.log(data)
            })
        },

        // --------------------------------------------------------------------------

        changeOption() {
            this.getSnaAPI(window.domain)
        },

        changeStartTime(event) {
            var mm = event.getMonth()+1
            this.startTime = event.getFullYear() + '/' + mm + '/' + event.getDate()
            this.getSnaAPI(window.domain)
        },

        changeEndTime(event) {
            var mm = event.getMonth()+1
            this.endTime = event.getFullYear() + '/' + mm + '/' + event.getDate()
            this.getSnaAPI(window.domain)
        },

        selectCheckBox() {
            this.getDomainAPI()
            this.getSnaAPI(window.domain)
        },

        checkAll(cName) {
            var obj = document.getElementsByName('all')
            var objOpt = document.getElementsByName(cName)
            var objLen = objOpt.length

            for(i=0; i<objLen; i++) {
                if(obj[0].checked == true) {
                    objOpt[i].checked = true

                }else {
                    objOpt[i].checked = false

                }
            }
        },

        getDomainAPI() {
            const req = new Request('https://140.124.93.123:8070/node_list?start_time=' + this.startTime + '&end_time=' + this.endTime + '&cate=[' + this.classCheck.toString() + ']&cnt_con=3&rr_con=0.1');
            fetch(req)
                .then(res => res.json())
                .then(data => {
                    this.$data.domains = data
                    this.setDomainList()
                })
        },

        setDomainList() {
            var dataList = document.getElementById("domains");
            while(dataList.options.length > 0) {
                dataList.removeChild(document.getElementById("domainOpt"))
            }
            
            for(i=0; i<this.domains.length; i++) {
                var dom = this.domains[i];
                var opt = document.createElement("option");
                opt.setAttribute('label', dom.label);
                opt.setAttribute('value', dom.value);
                opt.setAttribute('id', "domainOpt")
                dataList.appendChild(opt);
            }
        },

        selectDomain(event) {
            window.domain = event.target.value
            this.getSnaAPI(window.domain)
        },

        getSnaAPI(domain) {
            const req = new Request('https://140.124.93.123:8070/sna_data?domain=' + domain + '&max_deep=' + this.stage + '&start_time=' + this.startTime + '&end_time=' + this.endTime + '&cate=[' + this.classCheck.toString() + ']&cnt_con=3&rr_con=0.1');

            window.chartData = null;
            
            const getData = fetch(req)
                .then(res => {
                    
                    return res.json()
                })
                .then(data => {
                    window.chartData = data
                    this.$data.urls = window.chartData.nodes
                    this.articles = null
                    this.sna()
                    this.getArticleAPI()
                    this.getWordCloudAPI()
                    this.getLineChartAPI()
                });
        },

        getWordCloudAPI() {
            const req = new Request('https://140.124.93.123:8070/word_cloud?start_time=' + this.startTime + '&end_time=' + this.endTime + '&cate=[' + this.classCheck.toString() + ']')
            fetch(req)
                .then(res => res.json())
                .then(data => {
                    this.wordCloud = data
                    this.setWordCloud(this.wordCloud, 'wordcloud')
                })
        },

        setWordCloud(data, id) {
            // document.getElementById('wordcloud').childNodes[0].remove()
            anychart.onDocumentReady(function() {
                
                // create a tag (word) cloud chart
                window.chart = anychart.tagCloud(data);

                // set an array of angles at which the words will be laid out
                chart.angles([0])
                // enable a color range
                chart.colorRange(false);
                // set the color range length
                chart.colorRange().length('80%');

                chart.height('400px')
                chart.maxHeight('400px')
                
                // display the word cloud chart
                chart.container(id);
                
                chart.draw();

                setTimeout(window.removeWC(id), 100)
            });
        },

        getLineChartAPI() {
            window.lineChartData = null;
            
            const req = new Request('https://140.124.93.123:8070/cate_lines?start_time=' + this.startTime + '&end_time=' + this.endTime + '&cate=[' + this.classCheck.toString() + ']&cnt_con=3&rr_con=0.1&csvOrjson=2')
            fetch(req)
                .then(res => res.json())
                .then(data => {
                    this.lineChartData = {
                        columns: data.fieldNames,
                        rows: data.fieldValues
                    }
                })
        },

        getArticleAPI() {
            const req = new Request('https://140.124.93.123:8070/arti_list?start_time=' + this.startTime + '&end_time=' + this.endTime + '&cate=[' + this.classCheck.toString() + ']');
            fetch(req)
                .then(res => res.json())
                .then(data => {
                    this.articles = data
                })
        },

        sendClickDomain(id) {
            window.domain = id
            this.getSnaAPI(window.domain)
        },

        sna() {
            d3.select("svg").remove();
        
            const width = 800;
            const height = 600;

            // --------------------------------------------------------------------------------
        
            const links = window.chartData.links.map(d => Object.create(d));
            const nodes = window.chartData.nodes.map(d => Object.create(d));
            const rumorRatios = Array.from(new Set(links.map(d => d.rumor_ratio)));
            const lineColors = Array.from(new Set(links.map(d => d.color)));
            const nodeColor = d3.scaleOrdinal(["Content Farm", "Unknown", "Normal"], ["#FF0000", "#000000", "#00FF00"]);
            const color = d3.scaleOrdinal(rumorRatios, lineColors);
        
            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id(d => d.id))
                .force("charge", d3.forceManyBody().strength(-400))
                .force("x", d3.forceX())
                .force("y", d3.forceY());

            const drag = simulation => {
                
                function dragstarted(event, d) {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                }
        
                function dragged(event, d) {
                    d.fx = event.x;
                    d.fy = event.y;
                }
        
                function dragended(event, d) {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }
        
                return d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", null); // dragended
            };
        
            function linkArc(d) {
                const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
                return `
                    M${d.source.x},${d.source.y}
                    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
                `;
            }
        
            const svg = d3.select("#sna-domain-relationship").append("svg");
        
            svg.attr("viewBox", [-width / 2, -height / 2, width, height])
                .style("font", "12px sans-serif");
        
            // Per-type markers, as they don't inherit styles.
            svg.append("defs").selectAll("marker")
                .data(rumorRatios)
                .join("marker")
                    .attr("id", d => `arrow-${d}`)
                    .attr("viewBox", "0 -5 10 10")
                    .attr("refX", 15)
                    .attr("refY", -0.5)
                    .attr("markerWidth", 6)
                    .attr("markerHeight", 6)
                    .attr("orient", "auto")
                .append("path")
                    .attr("fill", color)
                    .attr("d", "M0,-5L10,0L0,5");
        
            const link = svg.append("g")
                    .attr("fill", "none")
                    .attr("stroke-width", 1.5)
                .selectAll("path")
                .data(links)
                .join("path")
                    .attr("stroke", d => d.color)
                    .attr("marker-end", d => `url(${new URL(`#arrow-${d.rumor_ratio}`, location)})`);
        
            link.append("title")
                .text(d => "來源網域：" + d.source.id + "\n目標網域：" + d.target.id + "\n關聯假文章比例：" + (d.rumor_ratio*100).toFixed(2) + "%")
                .attr("fill", "black");
        
            const node = svg.append("g")
                    .attr("fill", "currentColor")
                    .attr("stroke-linecap", "round")
                    .attr("stroke-linejoin", "round")
                .selectAll("g")
                .data(nodes)
                .join("g")
                    .call(drag(simulation));
        
            node.append("circle")
                .attr("fill", d => nodeColor(d.status))
                .attr("stroke", "white")
                .attr("stroke-width", 1.5)
                .attr("r", 4);
        
            node.append("text")
                .attr("x", 8)
                .attr("y", "0.31em")
                .text(d => d.id)
                .clone(true).lower()
                .attr("fill", "none")
                .attr("stroke", "white")
                .attr("stroke-width", 3);
        
            node.append("title")
                .text(function(d) { if(d.status=="Unknown"){return "網域類型：未知" + "\n假文章數：" + d.rumor_cnt + "\n真文章數：" + d.not_rumor_cnt + "\n文章總數：" + d.total_cnt + "\n假文章比例：" + (d.rumor_ratio*100).toFixed(2) + "%"}else if(d.status=="Normal"){return "網域類型：良好網域" + "\n假文章數：" + d.rumor_cnt + "\n真文章數：" + d.not_rumor_cnt + "\n文章總數：" + d.total_cnt + "\n假文章比例：" + (d.rumor_ratio*100).toFixed(2) + "%"}else{return "網域類型：內容農場" + "\n假文章數：" + d.rumor_cnt + "\n真文章數：" + d.not_rumor_cnt + "\n文章總數：" + d.total_cnt + "\n假文章比例：" + (d.rumor_ratio*100).toFixed(2) + "%"} })
                .attr("fill", "black");
        
            simulation.on("tick", () => {
                link.attr("d", linkArc);
                node.attr("transform", d => `translate(${d.x},${d.y})`);
            });
        }
    }
});
