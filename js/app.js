window.readJSON = function (fileName) {
    var request = new XMLHttpRequest();
    request.open("GET", "../" + fileName + ".json", false);
    request.send(null)
    var dataJson = JSON.parse(request.responseText);
    return dataJson;
}

window.domain = "today.line.me"

const articles = window.readJSON("arti_list");
let domains = null;
let urls = null;
var date = new Date();
var month = date.getMonth() + 1;
var today = date.getFullYear() + '/' + month + '/' + date.getDate();

let selectStartTime = ''

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
        domains,
        urls,
        articles,
        stage: '3',
        startTime: '2018/1/1',
        endTime: today,
        zh: vdp_translation_zh.js,
        format: 'yyyy/MM/dd',
        classCheck: []
    },
    mounted() {
        this.getSnaAPI(window.domain)
    },
    methods: {
        sendSearchData() {
            this.mockResultSearchData();
        },

        clearSearchResult() {
            this.isSearchPopuped = false;
            this.searchResultData = {
                urlTFvalue: undefined,
                contentTFvalue: undefined,
                accTF: undefined
            };
        },

        changeOption(event) {
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
            for(i=0; i<this.classCheck.length; i++) {

            }
            this.getDomainAPI()
            this.getSnaAPI(window.domain)
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
            
            for(i=0; i<this.domains.length; i++) {
                var dom = this.domains[i];
                var opt = document.createElement("option");
                opt.setAttribute('label', dom.label);
                opt.setAttribute('value', dom.value);
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
                    this.sna()
                    this.getArticleAPI()
                });
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
            const nodeColor = d3.scaleOrdinal(["Content Farm", "Unknown", "Normal"], ["red", "black", "green"]);
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
        },

        // mock api
        mockResultSearchData() {
            this.searchResultData = {
                urlTFvalue: 67.6,
                contentTFvalue: 83.345,
                accTF: 75.47
            };
            this.isSearchPopuped = true;
        }
    }
});
