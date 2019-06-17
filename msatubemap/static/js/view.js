let app = new Vue({
    el: '#app',
    delimiters: ["[[", "]]"],
    data: {
        // svgID: "\#" + "svg",
        nodes: null,
        tracks: null,
        reads: null,
        haplotypeColors: 'plainColors',
        tmpColor: null,
        haplotypeColorsList: ['plainColors', 'lightColors', 'greys', 'blues', 'reds'],
        // nodeWidth: 0
        isCompressed: false,
        nogname: null,
        smallFasta: ">spp.1\nATGCGTACTAGTAC\n>spp.2\nATGCGTA---GTAC\n>spp.3\nATGCCTACTAGTAC",
        loading: false,
        notFound: false,
        rendering: false,
    },
    watch: {
        haplotypeColors: function() {
            setColorSet('haplotypeColors', this.haplotypeColors);
        },
        compressNodes: function() {
            setNodeWidthOption(this.isCompressed ? 2 : 0);
        },
    },
    methods: {
        tubemapHandler: function(submitType, event) {
            event.preventDefault();
            this.loading = true;
            this.notFound = false;
            d3.selectAll("svg > *").remove();
            const method = "POST";
            const headers = {
                'Accept': 'application/json',
                'Content-type': 'application/json'
            };
            let body;
            let url;
            if (submitType === 0) {
                body = JSON.stringify({ 'fasta': document.getElementById("textarea").value });
                url = "/graph/custom";
            } else if (submitType === 2) {
                body = {}
                url = "/graph/eggnog/" + this.nogname;
            }

            fetch(url, { method, headers, body })
                .then(res => {
                    if (res.ok) {
                        this.loading = false;
                        return res.json();
                    } else {
                        this.loading = false;
                        this.notFound = true;
                        return Promise.reject(new Error(this.nogname + " not found."));
                    }
                })
                .then(function(myJson) {
                    if (Object.keys(myJson).length != 0) {
                        this.nodes = vgExtractNodes(myJson);
                        this.tracks = vgExtractTracks(myJson);
                        this.rendering = true;
                        create({
                            svgID: '#svg',
                            nodes: this.nodes,
                            tracks: this.tracks
                        })
                        this.rendering = false;
                    }
                })
                .catch(console.error);
        },
    }
})
