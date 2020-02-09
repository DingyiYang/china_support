//开始进行数据定义
    let self=this

    /*let data_keys=["main_data","cure_data","death_data"]
    let data_key_chinese=["确诊","治愈","死亡"]
    let data_key_eng=["case","cured","dead"]*/
    let data_keys=["main_data"]
    let data_key_chinese=["确诊"]
    let data_key_eng=["case"]

    /*let overview_chinese=["国家","确诊"]
    let overview_eng=["Countries","Confirmed"]*/
    let overview_chinese=["省份","确诊"]
    let overview_eng=["Provinces","Confirmed"]

    var brush_flag=0;
    let inTimeRect=0;
    let play_flag=0;//表示是否正在播放
    let isEnd=1;
    let inline=0;
    let incircle=0;
    let isregain=1;
    //范围数据（可以是时间范围或者数据范围）
    let web_title
    let chinese_title
    let sub_tiltle_chinese
    let sub_tiltle
    let data_range
    let axis_range
    let data_point
    let dataSource
    let dataSource_chinese
    let data_url
    let mapSource
    let map_url
    let num_unit
    let chineses_unit
    let show_path
    let use_brush
    let use_dragBlock
    let use_date_axis

    let line_color=["white","gray"]
    let circle_color=["yellow","white"]
    let color_scales={}

    let selected_map="china"
    let selected_dataset="nCoV"
    //数据是否为日期格式，如果是的话，需要在进行时间轴相关操作时进行换算
    let is_date=0
    let animation_t
    let change_view=0
    let temp_time
   
    /*data_range=[{"name":"1909-1956","id":0,"range":[1909,1956]},
                {"name":"1957-1977","id":1,"range":[1957,1977]},
                {"name":"1978-1995","id":2,"range":[1978,1995]},
                {"name":"1996-2009","id":3,"range":[1996,2009]},
                {"name":"2010-2019","id":4,"range":[2010,2019]}]
    //关键事件的数据
    data_point=[{"year":1909,"event":"First detected in Kenya","chinese_event":"首次在肯尼亚发现"},
                {"year":1957,"event":"Introduced into Europe","chinese_event":"传播到欧洲"},
                {"year":1978,"event":"Spread to South America, ","chinese_event":"蔓延到南美,"},
                {"year":1978,"event":"line2:Central Africa  ","chinese_event":"line2:中非"},
                {"year":1996,"event":"Outbreak in Ivory Coast","chinese_event":"在科特迪瓦以及"},
                {"year":1996,"event":"line2:and countries nearby","chinese_event":"line2:周围国家爆发"},
                {"year":2007,"event":"Spread to Caucasus","chinese_event":"传播到高加索地区"},
                {"year":2018,"event":"Occurred in China","chinese_event":"在中国爆发"}]*/
    //地图绘制的数据 
    let map_data={}
    //地图绑定的信息的数据
    let statistics_data={}
    //连线数据
    let path_data={}
    //页面其他信息的数据
    let component_data={}

    var event_years=[1957,1996,2000]

    let best_scale=600/1280
    let screen_scale=540/1280
    let screen_scale2=680/1280
    let screen_scale3=1.2
    let font_scale=1
    let temp_lan="english"
    let temp_map="world"
    /*var width = document.body.clientWidth; 
    var height = document.body.clientHeight;*/
    //var width = Math.min(window.innerWidth,document.body.clientWidth); 
    //var height = Math.min(window.innerHeight,document.body.clientHeight);
    //宽度
    let width=$('#mapPanel').width()
    //高度
    let height=$('#mapPanel').height()
    //font_scale=Math.min(height/screen.height,width/screen.width)*1.2
    font_scale=Math.min(height/window.screen.height,width/window.screen.width)*1.2
    let svg_x=0
    let svg_y=height*0.005
    width=width-svg_x*2
    height=height-svg_y*2
    //console.log("width="+width)
    //console.log("height="+height)
    if(height*0.9>width*screen_scale2){
        svg_y=(height*0.9-width*screen_scale2)/2
        height=width*screen_scale2
        font_scale=Math.min(height,width)*0.0017
    }
    else if(width>height/screen_scale){
        svg_x=(width-height/screen_scale)/2
        width=height/screen_scale
        font_scale=Math.min(height,width)*0.0017
    }
    //console.log(width)
    //console.log(height)

    var color=d3.scaleLinear()
        .domain([0, 4])
        .range(["rgba(240,140,131,0.8)","rgba(187,0,0,0.9)" ])
        .interpolate(d3.interpolateHcl);
    /*var color = d3.scaleLinear()
        .domain([0, 4])
        .range(["rgb(253,215,108)","rgb(252,200,44)"])
        .interpolate(d3.interpolateHcl);*/
    var bascolor=["rgb(238,238,238)","rgb(111,213,201)","rgb(255,176,93)","rgb(255,119,105)","rgb(165,200,233)","rgb(244,172,88)"];
    let svg=d3.select("#mapPanel").append("svg")
        .attr("transform", "translate("+svg_x+","+svg_y+")")
        .attr("width", width)
        .attr("height", height)
        .append("g")

    d3.select("#floor")
        .style("bottom",(svg_y/screen.height)*100+"%")
        //.attr("transform", "translate(0,0)");
 

    var tooltip = d3.select("#tooltip");
 
    let proj_world=d3.geoMercator()
                        //.center([0, 16])
                        .center([0, 23])
                        .scale(d3.min([width/4.1,height/2.3])*0.7)
                        .translate([width/2, height/2]);
    let proj_china=d3.geoMercator()
                        .center([96, 37.1])
                        .scale(d3.min([width/1.8,height*1.2])*1.02)
                        .translate([width/2, height/2]);
    let proj_hubei=d3.geoMercator()
                        .center([112.2363,31.1572])
                        .scale(d3.min([width/1.8,height*1.2])*6)
                        .translate([width/2, height/2]);
    let proj=proj_world

    let path = d3.geoPath().projection(proj);

    var tooltip = d3.select("#tooltip");

    let axis_start=1900;
    let axis_end=2019;
    let is_data2axis=1;
    let show_detail=0 
    //如果数据是日期型数据的话，需要初始日期结合
    let start_date
    let stop_year=1909;//表示暂停时所处的年份
            timelineLen=height*0.3;//时间轴长度
    //timelineX=width*0.12
    //timelineX=width*0.03
    timelineX=proj_world([-170,0])[0]
            //timelineY=height*0.085
    timelineY=height*0.52
    var tScale=d3.scaleLinear()
                .domain([axis_start,axis_end])
                .range([0, timelineLen]);

    let inmap_flag=0
    let hasPath=0
    let inmap=0
    let intext=0

//南海
/*d3.xml("southchinasea.svg", function(error, xmlDocument) {
                    svg.html(function(d){
                            return d3.select(this).html() + xmlDocument.getElementsByTagName("g")[0].outerHTML;
                    });
                
                    let gSouthSea = d3.select("#southsea").attr("stroke","rgb(200,200,200)")
                    .attr("stroke-width",".2rem")
                    .attr("fill","none")
                    .attr("opacity",function(){
                        return 0.8
                    });
                
                gSouthSea.attr("transform","translate("+proj_world([105.5,28])[0]+","+proj_world([110,27])[1]+")scale("+d3.min([width/4.1,height/2.3])*0.7*0.0021+")")
                    .attr("class","southsea");
         
            });*/

d3.xml("southsea.svg", function(error, xmlDocument) {
                    svg.html(function(d){
                            return d3.select(this).html() + xmlDocument.getElementsByTagName("g")[0].outerHTML;
                    });
                
                    let gSouthSea = d3.select("#southsea").attr("stroke","rgb(200,200,200)")
                    .attr("stroke-width",".2rem")
                    .attr("fill","none")
                    .attr("opacity",function(){
                        return 0.8
                    });
                
                gSouthSea.attr("transform","translate("+proj_china([125.5,28])[0]+","+proj_china([110,27])[1]+")scale("+d3.min([width/4.1,height/2.3])*0.7*0.0021+")")
                    .attr("class","southsea");
         
            });
//获取数据
    //changeView(temp_map+"_"+"nCoV"+".json","path_"+"nCoV"+".json",temp_map+"_web_info_"+"nCoV"+".json")
    //selected_dataset="policy"
    //changeView(temp_map+"_"+"policy"+".json","",temp_map+"_web_info_"+"policy"+".json")
    //HideLeftView()


//获取数据的函数

    //基础地图数据获取
    function getMapData(fileName){
        d3.json(fileName, function (error, cn) {
            //基础地图数据的赋值
            map_data=cn

            //var parseDate = d3.timeFormat("%Y.%m.%d").parse;
            //添加用于用于刷选的时间轴
            })
    }

    //地图相关数据的获取
    function getStatisticData(fileName){

    }

    //连线数据的获取
    function getPathData(fileName){
        d3.json(fileName, function (error, move_path) {
            //连线数据的赋值
            path_data=move_path
        })
    }

    //地图内容数据的获取
    function getComponentData(components){
            //console.log(components)
            //地图内容数据的赋值
            web_title=components.web_title
            sub_tiltle=components.sub_tiltle
            sub_tiltle_chinese=components.sub_tiltle_chinese
            chinese_title=components.chinese_title
            data_range=components.data_range
            axis_range=components.axis_range
            data_point=components.data_point
            dataSource=components.dataSource
            data_url=components.data_url
            mapSource=components.mapSource
            map_url=components.map_url
            chineses_unit=components.chinese_unit
            num_unit=components.unit
            //是否为日期型数据
            is_date=components.is_date_data
            is_data2axis=components.is_data2axis
            show_detail=components.show_detail
            //console.log(components)
            //console.log(data_point)
            mapSource=components.mapSource
            dataSource_chinese=components.dataSource_chinese
            show_path=components.show_path

            use_dragBlock=components.use_dragBlock
            use_brush=components.use_brush
            use_date_axis=components.use_date_axis

            axis_start=axis_range[0];
            axis_end=axis_range[1];

            temp_time=axis_end.toString()
            let axis_0=axis_start
            let axis_1=axis_end
            color=d3.scaleLinear()
                .domain([0, data_range.length-1])
                .range(["rgba(240,140,131,0.8)","rgba(187,0,0,0.9)" ])
                .interpolate(d3.interpolateHcl);
            if(selected_dataset=="policy"){
                //let color_policy=["","rgb(255, 205, 210)","rgb(239, 154, 154)","rgb(229, 115, 115)","rgb(255, 224, 178)","rgb(255, 183, 77)","rgb(251, 140, 0)","rgb(239, 108, 0)"]
                let color_policy=["","rgb(242, 237, 204)","rgb(244, 218, 173)","rgb(237, 191, 163)","rgb(237, 170, 163)","rgb(212, 126, 152)","rgba(161, 63, 113,0.8)","rgba(106, 51, 109,0.8)"]
                let colorRange=d3.range(7).map(function(i) { return color_policy[i] });
                color=d3.scaleThreshold()//阈值比例尺
                        .domain([0,1,2,3,4,5,6])
                        .range(color_policy);
                    }
            //如果是日期型数据
            if(is_date==1||is_data2axis==0||use_date_axis==1){
                start_date=axis_range[0]
                axis_0=0;
                axis_1=countGapDays(axis_range[0],axis_range[1]);
                //console.log(axis_end)
            }


            tScale=d3.scaleLinear()
                .domain([axis_0,axis_1])
                .range([0, timelineLen]);
            //console.log(tScale(axis_start))

    }


//进行绘制的各种函数
    //绘制地图
    function addMap(action){
        if(action!="new"){
            svg.selectAll(".state").remove()
            //svg.selectAll(".states").remove()
            }
            /*d3.selectAll(".country_text")
                .attr("opacity",function(d){if(d.properties.chinese_name=="湖北") return 0})
            d3.selectAll(".country_num_text")
                .style("opacity",function(d){if(d.properties.chinese_name=="湖北") return 0})
            d3.selectAll(".country_num_text_shadow")
                .style("opacity",function(d){if(d.properties.chinese_name=="湖北") return 0})*/
            //绘制国家
            let state=svg.append("g")
                .attr("class","state")

            state.selectAll("path")
                    .data(map_data.features)
                    .enter()
                    .append("path")              
                    .attr("d", path)
                    //.attr("class","states")  
                    .attr("fill",function(d,i){
                        if(d.properties.stage=='null'){
                            if(selected_dataset=="policy"&&d.properties.chinese_name=="中国") return "rgba(210,210,210,1)"
                        }
                        else{
                            //return "blue"
                            return color(d.properties.stage)
                            
                        }
                        
                    })
                    .on("click",function(d){
                        //if(d.properties.chinese_name=="湖北") getMapDataAll()
                            if(d.properties.hasData==1&&d.properties.chinese_name!="湖北") Showmessage(d)
                    })
                    .on("mouseout",function(d){
                        if(isregain==0) Regainmessage()
                    })
                    .style("stroke",function(d){
                        if(d.properties.chinese_name=="湖北") return "rgba(20,20,20.0.5)"
                        let t_name= d.properties.chinese_name                            
                            if(t_name.length>=3&&t_name!="内蒙古"&&t_name!="黑龙江")
                                return "rgba(200,200,200,0.3)"
                    })
                    .style("stroke-width",function(d){
                        if(d.properties.chinese_name=="湖北") return 4*font_scale
                    })
                    /*.on("mouseover", function (d) {
                        //console.log(d.properties.name)
                        if(d.properties.hasData==1){
                            Showmessage(d);
                        }
                    })
                    .on("mouseout", function (d) {
                        if(d.properties.hasData==1){
                            //console.log("outmap")
                            setTimeout(function(){
                                Regainmessage();
                            },300)
                        }
                        tooltip.style("display", "none");
                    });*/
            d3.select("#southsea").attr("opacity",function(){
                        //if(temp_map=="china") 
                            return 0.8
                    });
    }

    //添加区域的名字
    function addDistrictName(){
            //用于高亮显示的名字
            d3.selectAll(".mouseover_text_1").remove()
            svg.selectAll(".mouseover_text_1")
                .data(map_data.features)
                .enter().append("text")
                .attr("class","mouseover_text_1")
                .text(function (d) {
                    //console.log(d.id);
                    return ""
                    /*if(d.properties.chinese_name.length>=3&&d.properties.chinese_name!="内蒙古") return ""
                    if(d.properties.cp!=0&&d.properties.hasData==1){
                        return d.properties.name.split(" ")[0];
                    }
                    else return;*/
                })           
                .attr("fill", "rgba(6,85,178,0.5)")
                .attr("x", function (d) {
                    if(d.properties.cp==0) return 0;
                    if(d.id!=""){
                    var local = proj([d.properties.cp[0], d.properties.cp[1]]);
                    //console.log(local[0]);
                    
                    return local[0]-d.properties.name.split(" ")[0].length*2;
                }
                })
                .attr("y", function (d) {
                    if(d.properties.cp==0) return ;
                    if(d.id!=""){
                    var local = proj([d.properties.cp[0], d.properties.cp[1]]);
                    return local[1]+5;
                }
                })
                .attr("dx",function(d,i){
                    return d.properties.dx;

                })
                .attr("dy",function(d,i){              
                    return d.properties.dy
                })
                .on("mouseover",function(){
                    intext=1
                })
                .on("mouseout",function(){
                    intext=0
                })
                .attr("font-size", function(d,i){
                    if(d.properties.main_data==1996) return 8*font_scale
                        else return 10*font_scale
                })
                .style("fill-opacity",0)

            d3.selectAll(".mouseover_text_2").remove()
            svg.selectAll(".mouseover_text_2")
                .data(map_data.features)
                .enter().append("text")
                .attr("class","mouseover_text_2")
                .text(function (d) {
                    //console.log(d.id);
                    return ""
                    /*if(d.properties.chinese_name.length>=3&&d.properties.chinese_name!="内蒙古") return ""
                    if(d.properties.cp!=0&&d.properties.hasData==1){
                        return d.properties.name.split(" ")[1];
                    }
                    else return;*/
                })           
                .attr("fill", "rgba(6,85,178,0.5)")
                .attr("x", function (d) {
                    if(d.properties.cp==0) return ;
                    if(d.id!=""){
                        var local = proj([d.properties.cp[0], d.properties.cp[1]]);
                        //console.log(local[0]);
                        return local[0]-d.properties.name.split(" ")[0].length*2;
                    }
                })
                .attr("y", function (d) {
                    if(d.properties.cp==0) return ;
                    if(d.id!=""){
                    var local = proj([d.properties.cp[0], d.properties.cp[1]]);
                    return local[1]+14;
                }
                })
                .attr("dx",function(d,i){
                    return d.properties.dx;

                })
                .attr("dy",function(d,i){
                    
                        return d.properties.dy
                })
                .on("mouseover",function(){
                    intext=1
                })
                .on("mouseout",function(){
                    intext=0
                })
                .attr("font-size", function(d,i){
                    if(d.properties.main_data==1996) return 8*font_scale
                        else return 10*font_scale
                })
                .style("fill-opacity",0)


            //添加国家名字
            d3.selectAll(".country_text").remove()
            svg.selectAll(".country_text")
                .data(map_data.features)
                .enter().append("text")
                .attr("class","country_text")
                .text(function (d) {
                    //console.log(d.id);
                    let t_name= d.properties.chinese_name                            
                    if(t_name.length>=3&&t_name!="内蒙古"&&t_name!="黑龙江") return ""
                    if(d.properties.cp!=0&&d.properties.hasData==1){
                        return d.properties.name.split(" ")[0];
                    }
                    else return;
                })           
                .attr("fill", "rgba(6,85,178,0.5)")
                .attr("x", function (d) {
                    if(d.properties.cp==0) return ;
                    if(d.id!=""){
                    var local = proj([d.properties.cp[0], d.properties.cp[1]]);
                    //console.log(local[0]);
                    return local[0]-d.properties.name.split(" ")[0].length*2*font_scale;
                }
                })
                .attr("y", function (d) {
                    if(d.properties.cp==0) return ;
                    if(d.id!=""){
                    var local = proj([d.properties.cp[0], d.properties.cp[1]]);
                    return local[1]+5*font_scale;
                }
                })
                .attr("dx",function(d,i){
                    return d.properties.dx;

                })
                .attr("dy",function(d,i){              
                    return d.properties.dy
                })
                    .on("click",function(d){
                        //if(d.properties.chinese_name=="湖北") getMapDataAll()
                           if(d.properties.hasData==1&&d.properties.chinese_name!="湖北") Showmessage(d)
                    })
                    .on("mouseout",function(d){
                        if(isregain==0) Regainmessage()
                    })
                /*.on("mouseover", function (d) {
                        //console.log(d.properties.name)
                        if(d.properties.hasData==1){
                            intext=1
                            Showmessage(d);
                        }
                        //tooltip.style("display", null);

                    })
                .on("mouseout", function (d) {
                        if(d.properties.hasData==1){
                            intext=0
                            setTimeout(function(){
                                if(intext==0&&inmap==0) Regainmessage();
                            },300)
                        }
                */
                .attr("font-size", function(d,i){
                    if(d.properties.main_data==1996) return 8*font_scale
                        else if(d.properties.cp[0]<25.5&&d.properties.cp[0]>18&&d.properties.cp[1]<50&&d.properties.cp[1]>40){
                            return 6*font_scale
                        }
                        else if(selected_dataset=="policy") return 9.2*font_scale
                        else return 10.5*font_scale
                })
                .attr("fill-opacity",1)
                .attr("opacity",1)


            d3.selectAll(".country_text2").remove()
            svg.selectAll(".country_text2")
                .data(map_data.features)
                .enter().append("text")
                .attr("class","country_text2")
                .text(function (d) {
                    //console.log(d.id);
                    let t_name= d.properties.chinese_name                            
                    if(t_name.length>=3&&t_name!="内蒙古"&&t_name!="黑龙江") return ""
                    if(d.properties.cp!=0&&d.properties.hasData==1){
                        return d.properties.name.split(" ")[1];
                    }
                    else return;
                })           
                .attr("fill", "rgba(6,85,178,0.5)")
                .attr("x", function (d) {
                    if(d.properties.cp==0) return ;
                    if(d.id!=""){
                    var local = proj([d.properties.cp[0], d.properties.cp[1]]);
                    //console.log(local[0]);
                    return local[0]-d.properties.name.split(" ")[0].length*2*font_scale;
                }
                })
                .attr("y", function (d) {
                    if(d.properties.cp==0) return ;
                    if(d.id!=""){
                    var local = proj([d.properties.cp[0], d.properties.cp[1]]);
                    return local[1]+14*font_scale;
                }
                })
                .attr("dx",function(d,i){
                    return d.properties.dx;

                })
                .attr("dy",function(d,i){
                    
                        return d.properties.dy
                })
                .on("click",function(d){
                    //if(d.properties.chinese_name=="湖北") getMapDataAll()
                            if(d.properties.hasData==1&&d.properties.chinese_name!="湖北") Showmessage(d)
                    })
                .on("mouseout",function(d){
                        if(isregain==0) Regainmessage()
                    })
                /*.on("mouseover", function (d) {
                        //console.log(d.properties.name)
                        if(d.properties.hasData==1){
                            intext=1
                            Showmessage(d);
                        }
                        //tooltip.style("display", null);

                    })
                    .on("mouseout", function (d) {
                        intext=0
                        if(d.properties.hasData==1){
                            setTimeout(function(){
                                if(intext==0&&inmap==0) Regainmessage();
                            },300)
                        }
                        //tooltip.style("display", "none");
                    })*/
                .attr("font-size", function(d,i){
                    if(d.properties.main_data==1996) return 8*font_scale
                        else if(d.properties.cp[0]<25.5&&d.properties.cp[0]>18&&d.properties.cp[1]<50&&d.properties.cp[1]>40){
                            return 6*font_scale
                        }
                        else if(selected_dataset=="policy") return 9.2*font_scale                       
                        else return 11*font_scale
                })
                .attr("fill-opacity",1)
                .attr("opacity",1)

            d3.selectAll(".country_num_text").remove()

            if(show_detail==0){
                return true
            }

            svg.selectAll(".country_num_text_shadow")
                .data(map_data.features)
                .enter().append("text")
                .attr("class","country_num_text_shadow")
                .text(function (d) {
                    //console.log(d.id);
                    let t_name= d.properties.chinese_name                            
                    if(t_name.length>=3&&t_name!="内蒙古"&&t_name!="黑龙江") return ""
                    if(d.properties.cp!=0&&d.properties.hasData==1){
                        let temp_data=""
                        if(is_data2axis==0) temp_data=d.properties.main_data[axis_end]
                            else temp_data=d.properties.main_data
                        return temp_data
                    }
                    else return;
                })
                .attr("x", function (d) {
                    if(d.properties.cp==0) return ;
                    if(d.id!=""){
                    var local = proj([d.properties.cp[0], d.properties.cp[1]]);
                    //console.log(local[0]);
                    return local[0]//-d.properties.name.split(" ")[0].length*0.5*font_scale;
                }
                })
                .attr("y", function (d) {
                    if(d.properties.cp==0) return ;
                    if(d.id!=""){
                    var local = proj([d.properties.cp[0], d.properties.cp[1]]);
                    if (d.properties.chinese_name.split(" ").length==1) return local[1]+18*font_scale;
                    else return local[1]+28*font_scale;
                }
                })
                .attr("mouseover",function(){
                    intext=1
                })
                .attr("mouseout",function(){
                    intext=0
                })
                .style("text-anchor","middle")
                .attr("dx",function(d,i){
                    return d.properties.dx+0.5*font_scale;

                })
                .attr("dy",function(d,i){
                    
                        return d.properties.dy+0.2*font_scale
                })
                .attr("font-size", function(d,i){
                    if(d.properties.main_data==1996) return 12*font_scale
                        else return 16*font_scale
                })
                .style("font-family","Khand-Regular")
                .style("font-weight","bold")
                .attr("fill-opacity",1)
                .attr("opacity",0.6)                         
                .style("fill", "white")

            svg.selectAll(".country_num_text")
                .data(map_data.features)
                .enter().append("text")
                .attr("class","country_num_text")
                .text(function (d) {
                    //console.log(d.id);
                    let t_name= d.properties.chinese_name                            
                    if(t_name.length>=3&&t_name!="内蒙古"&&t_name!="黑龙江") return ""
                    if(d.properties.cp!=0&&d.properties.hasData==1){
                        let temp_data=""
                        if(is_data2axis==0) temp_data=d.properties.main_data[axis_end]
                            else temp_data=d.properties.main_data
                        return temp_data
                    }
                    else return;
                })
                .attr("x", function (d) {
                    if(d.properties.cp==0) return ;
                    if(d.id!=""){
                    var local = proj([d.properties.cp[0], d.properties.cp[1]]);
                    //console.log(local[0]);
                    return local[0]//-d.properties.name.split(" ")[0].length*0.5*font_scale;
                }
                })
                .attr("y", function (d) {
                    if(d.properties.cp==0) return ;
                    if(d.id!=""){
                    var local = proj([d.properties.cp[0], d.properties.cp[1]]);
                    if(temp_lan=="chinese"||(d.properties.chinese_name.split(" ").length==1)) return local[1]+18*font_scale;
                    else return local[1]+28*font_scale;
                }
                })
                /*.attr("mouseover",function(){
                    intext=1
                })
                .attr("mouseout",function(){
                    intext=0
                })*/               
                    .on("click",function(d){
                        //if(d.properties.chinese_name=="湖北") getMapDataAll()
                            Showmessage(d)
                    })
                    .on("mouseout",function(d){
                        if(isregain==0) Regainmessage()
                    })
                .style("text-anchor","middle")
                .attr("dx",function(d,i){
                    return d.properties.dx;

                })
                .attr("dy",function(d,i){
                    
                        return d.properties.dy
                })
                .attr("font-size", function(d,i){
                    if(d.properties.main_data==1996) return 12*font_scale
                        else return 14*font_scale
                })
                .style("font-family","Khand-Regular")
                .style("font-weight","bold")
                .attr("fill-opacity",1)
                .attr("opacity",1)                         
                //.attr("fill", "rgba(247,254,110,1)")
                .style("fill", "rgba(95,0,0,0.97)")
    }

    //添加区域的关联数据（颜色、详细信息等）
    function addMapStatistic(){
        //添加帮助显示国家的rect
            d3.selectAll(".viewrect").remove()
            var coutry_box=svg.append("rect")
                .attr("class","viewrect")
                .attr("width",width/20)
                .attr("height",height/20)
                .style("fill","white")
                .style("fill-opacity",.0)
    }

    //添加时间轴/范围轴 以及 关键事件
    function addAxis(){

            let tAxis = d3.axisRight(tScale)
                .ticks(0)
                .tickSizeOuter(0)
                //.tickValues()
                .tickFormat(function(v) { // 格式化刻度值
                    return ""
                        //if(v==0) return v;
                        //if(v==1900||v==1950||v==2000) return v;
                 });


            svg.select(".axis").remove()
            var time_axis=svg.append("g")
                    .attr("class","axis")
                    .attr("transform","translate(" +(timelineX) + "," +(timelineY) + ")")
                    .call(tAxis);
            //关键事件
            svg.selectAll(".point_text").remove()
            var point_text=svg.selectAll(".point_text")
                    .data(data_point)
                    .enter()
                    .append("text")
                    .attr("class","point_text")
                    .attr("font-size",10*font_scale)
                    .attr("x",function(d,i){
                        if (d.event.split(":").length==2) return timelineX+width*0.045;
                        return timelineX+width*0.022;
                     })
                    .attr("y",function(d,i){
                        let temp_data=d.year
                        if(is_date==1||is_data2axis==0||use_date_axis==1) temp_data=countGapDays(start_date,temp_data)
                        if (d.event.split(":").length==2) return timelineY+tScale(temp_data)+height*0.007*3
                        else return timelineY+tScale(temp_data)+height*0.007
                    })
                    .text(function(d,i){
                        if (d.event.split(":").length==2) return d.event.split(":")[1]
                        return date2str(d.year)+num_unit+": "+d.event;
                    })
                    //.attr("fill","white")
                    .style("fill-opacity",.9);
            d3.selectAll(".point_line").remove()
            var line=svg.selectAll(".point_line")
                .data(data_point)
                .enter()
                .append("path")
                .attr("class","point_line")
                .attr("d",function(d,i){
                    let temp_data=d.year
                    if(is_date==1||is_data2axis==0||use_date_axis==1) temp_data=countGapDays(start_date,temp_data)
                    return "M"+(timelineX)+","+(timelineY+tScale(temp_data))+" L"+(timelineX+width*0.02)+","+(timelineY+tScale(temp_data))

                })
                .attr("stroke","rgba(160,160,160,0.7)")
                .attr("stroke-dasharray","3,3")
            //刷选框
                d3.selectAll(".brush").remove()
                d3.selectAll(".slide_rect").remove()
            if(use_brush==1){
                let brush=d3.brushY()
                    .extent([[timelineX-width/60, timelineY], [timelineX, timelineY+timelineLen]])
                    .on("brush end", display);
                svg.select(".brush").remove()
                svg.append("g")
                    .attr("class", "brush")
                    .call(brush)
                    .call(brush.move, [timelineY,timelineY+timelineLen]);
            }
            
            if(use_dragBlock==1){
                addDragBlock()
            }
    }

    //添加连线和circle
    function addPath(hasPath){
        if(hasPath==false){
            d3.selectAll(".links").remove()
            d3.selectAll(".mycircle").remove()
            return
        }
        var defs = svg.append("defs");
            //箭头maker
            var arrowMarker = defs.append("marker")
                            .attr("id","arrow")
                            .attr("markerUnits","strokeWidth")
                            .attr("markerWidth","7")
                            .attr("markerHeight","7")
                            .attr("viewBox","0 0 10 10") 
                            .attr("refX","6")
                            .attr("refY","6")
                            .attr("orient","auto");

            var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
                            
            arrowMarker.append("path")
                .attr("d",arrow_path)
                .attr("fill","rgb(190,190,190)")
                .attr("fill-opacity",0.7);
            //迁移过程曲线
            // filters go in defs element
            var defs = svg.append("defs");

            // create filter with id #drop-shadow
            // height=130% so that the shadow is not clipped
            var filter = defs.append("filter")
                .attr("id", "drop-shadow")
                .attr("height", "140%");

            // SourceAlpha refers to opacity of graphic that this filter will be applied to
            // convolve that with a Gaussian with standard deviation 3 and store result
            // in blur
            filter.append("feGaussianBlur")
                .attr("in", "SourceAlpha")
                .attr("stdDeviation", 4)
                .attr("result", "blur");

            // translate output of Gaussian blur to the right and downwards with 2px
            // store result in offsetBlur
            filter.append("feOffset")
                .attr("in", "blur")
                .attr("dx", 5)
                .attr("dy", 6)
                .attr("result", "offsetBlur");

            // overlay original SourceGraphic over translated blurred opacity by using
            // feMerge filter. Order of specifying inputs is important!
            var feMerge = filter.append("feMerge");

            feMerge.append("feMergeNode")
                .attr("in", "offsetBlur")
            feMerge.append("feMergeNode")
                .attr("in", "SourceGraphic");

            d3.selectAll(".links").remove()
            var country_link=svg.selectAll(".links")
                    .data(path_data)
                    .enter()
                    .append("path")
                    .attr("class","links")
                    .attr("d", function(d){
                        if(d.source.name=="Russia"||d.target.name=="Tanzania") return link_2(d)
                        if(d.source.name=="Angola") return link_3(d)
                        return link(d)
                    })
                 .attr("marker-end","url(#arrow)")
                 /*.style("fill",function(d,i){
                    if(d.source.name=="Kenya") return "rgb(160,160,160)"
                 })*/
                 .attr("filter", function(d){
                    if(Math.abs(d.target.x-d.source.x)>15&&d.source.name!="Portugal") return "url(#drop-shadow)";
                })
                 .attr("fill",function(d){
                    if(Math.abs(d.target.x-d.source.x)<15||d.source.name=="Portugal") return "black"

                 })
                 .on("mouseover",function(){
                    //console.log("inline")
                    inline=1;
                    inmap=1
                 })
                 .on("mouseout",function(){
                    inline=0;
                    inmap=0
                 })
                 .attr("stroke-width",0)
                 .attr("fill-opacity",0.06)
                 .attr("stroke-opacity",0.8)
                 .style("opacity",function(){
                    return show_path
                 });

            d3.selectAll(".mycircle").remove()
            var circles=svg.selectAll(".mycircle")
                    .data(path_data)
                    .enter()
                    .append("circle")
                    .attr("class","mycircle")
                    .attr("r",0)
                    .attr("cx",function(d,i){
                        maploc=proj([d.source.x, d.source.y])
                        return maploc[0];
                    })
                    .attr("cy",function(d,i){
                        maploc=proj([d.source.x, d.source.y])
                        return maploc[1];

                    })
                    /*
                    .on("mouseover",function(d){

                        Showmessage(d);
                    })
                    .on("mouseout",function(d){
                        Regainmessage()
                    })*/
                    .on("mouseover", function (d) {
                        inmap=1

                    })
                    .on("mouseout", function (d) {
                        inmap=0
                    })
                    .attr("fill","rgb(247,254,174)")
                    .style("opacity",function(){
                        return show_path
                    })
    }

    //添加范围矩阵
    function addRangeRect(){
            let rect_width=width/18
            if(selected_dataset=="policy") rect_width=width/10
            let rect_height=height*0.025
            /*for(var i=0;i<data_range.length;i++){
                let range_name_width=data_range[i].name.length*font_scale*7
                if(range_name_width>rect_width) rect_width=range_name_width
            }*/
            var rect_scale=height/27
            var dx_rect=-rect_width-width/32
            let rectY=timelineY-rect_height*(data_range.length+1)
            //console.log(data_range)

            if(selected_map=="china"){
                rect_height=height*0.03
                rectY=timelineY-rect_height*(data_range.length+3)
            }

            d3.selectAll(".range_rect").remove()

            var rect=svg.selectAll(".range_rect")
                .data(data_range)
                .enter()
                .append("rect")
                .attr("class","range_rect")
                .attr("transform","translate(" + 0+ "," +0 + ")")
                .attr("x",function(d,i){
                    return timelineX
                })
                .attr("y",function(d,i){
                    //return 30+i*(rect_scale+10);
                    //if(is_data2axis==0) 
                    return rectY+rect_height*i
                    /*if(is_date==1){
                        return tScale(countGapDays(start_date,d.range[0]))+rectY
                    }
                    return tScale(d.range[0])+rectY*/
                })
                .attr("width",function(d,i){
                    return rect_width;
                })
                .attr("height",function(d){
                    //if(is_data2axis==0) 
                        return rect_height
                    /*if(is_date==1){
                        return tScale(countGapDays(start_date,d.range[1]))-tScale(countGapDays(start_date,d.range[0]))
                    }
                    return tScale(d.range[1])-tScale(d.range[0])*/
                })
                .attr("fill",function(d,i){ 
                    return color(d.id)
                })
                .style("stroke","white")
                .style("stroke-opacity",0.6)
                .on("mouseover",function(d,i){
                    Highlight(d);

                })
                .on("mouseout",function(d,i){
                     Regain(d);

                });

            d3.selectAll(".range_name").remove()
            var range_text=svg.selectAll(".range_name")
                    .data(data_range)
                    .enter()
                    .append("text")
                    .attr("class","range_name")
                    .attr("font-size",function(d){
                        if(d.name.length*font_scale*11>rect_width) return (rect_width/d.name.length)
                        else return 11*font_scale
                    })
                    .attr("transform","translate(" + rect_width*0.05+ "," +0 + ")")
                    .on("mouseover",function(d,i){
                    Highlight(d);

                })
                .on("mouseout",function(d,i){
                    if(d.id==data_range.length-1) Regain(d);

                })
                .attr("x",function(d,i){
                    return timelineX;
                 })
                .attr("y",function(d,i){
                    //if(is_data2axis==0)
                        return rectY+rect_height*i+12*font_scale
                    /*if(is_date==1) return tScale(countGapDays(start_date,d.range[0]))+rectY+rect_scale*3/5
                    return tScale(d.range[0])+rectY+rect_scale*3/5*/
                })
                .text(function(d,i){
                    return ""+d.name;
                })
                .attr("stroke",function(){
                    if(selected_dataset=="policy") return "rgb(100,100,100)"
                })
                .style("stroke-width",function(){
                    if(selected_dataset=="policy") return 0.1*font_scale
                })

    }

    //添加标题、数据来源等
    function addOtherInfo(){
            //添加title
            
            d3.selectAll(".shadow_title").remove()         
            var shadow_text=svg.append("text")
                      .attr("x",timelineX)
                      .attr("y",height*0.05)
                      .attr("class", "shadow shadow_title")
                      .attr("font-size",22*font_scale)
                      .text(web_title);
            d3.selectAll(".title").remove()  
            var title=svg.append("text")
                                .attr("class","title")
                                .attr("x",timelineX)
                                .attr("y",height*0.05)
                                .attr("font-size",22*font_scale)
                                .text(web_title)
            d3.selectAll(".subtitle").remove()  
            var title=svg.append("text")
                                .attr("class","subtitle")
                                .attr("x",timelineX)
                                .attr("y",height*0.09)
                                .attr("font-size",14*font_scale)
                                .text(function(){
                                    if(temp_lan=="chinese") return sub_tiltle_chinese
                                        else return sub_tiltle
                                })
            //添加数据来源
            d3.selectAll(".source_text").remove() 
            let data_source=svg.append("text")
                .attr("class","source_text source1")
                .attr("x",width*0.70)
                .attr("y",(height*0.97))
                .attr("font-size",11*font_scale)
                .text("Data Source: "+dataSource)
                /*.on("mouseover",function(d){
                    data_source.style("fill","white")

                })
                .on("mouseout",function(){
                    data_source.style("fill","rgb(80,80,80)")
                })*/
                .attr("cursor","pointer")
                .on("click",function(){
                    window.open(""+data_url);
                })

            let map_source=svg.append("text")
                .attr("class","source_text source2")
                .attr("x",width*0.7)
                .attr("y",height*0.99)
                .attr("font-size",11*font_scale)
                .text("Map Source: github.com/johan/world.geo.json")
                /*.on("mouseover",function(d){
                    map_source.style("fill","white")

                })
                .on("mouseout",function(){
                    map_source.style("fill","rgb(80,80,80)")
                })*/             
                .attr("cursor","pointer")
                .on("click",function(){
                    window.open(""+map_url);
                })

            //刷选以及播放动画时显示的范围
            d3.selectAll(".range_text").remove()
            var range_text=svg.append("text")
                        .attr("class","range_text")
                        .attr("x",timelineX-font_scale*4)
                        .attr("y",timelineY+timelineLen+height/25)
                        .text(axis_start+"-"+axis_end)
                        .attr("font-size",18*font_scale)
                        .style("text-anchor","left")
                        .style("fill","rgba(160,160,160,0.8)")
                        .attr("opacity",1)
                        .style("font-family","Khand-Regular")
            d3.selectAll(".overview_country").remove()
            d3.selectAll(".overview_num").remove()
            if(is_data2axis==0){
                let overview_country=svg.append("text")
                        .attr("class","overview_country")
                        .attr("x",timelineX-font_scale*4)
                        .attr("y",timelineY+timelineLen+height/25+22*font_scale)
                        .text(function(){
                            //console.log(map_data.overview)
                            return "Countries: "+map_data.overview[axis_end.toString()].country_num
                        })
                        .attr("font-size",17*font_scale)
                        .style("text-anchor","left")
                        .style("font-family","Khand-Regular")
                        //.attr("font-weight","bold")
                        .style("fill","rgba(160,160,160,0.8)")
                        .attr("opacity",1)
                let overview_num=svg.append("text")
                        .attr("class","overview_num")
                        .attr("x",timelineX-font_scale*4)
                        .attr("y",timelineY+timelineLen+height/25+42*font_scale)
                        .text(function(){
                            //console.log(map_data.overview)
                            return "Confirmed: "+map_data.overview[axis_end.toString()].data_sum
                        })
                        .attr("font-size",17*font_scale)
                        .style("text-anchor","left")
                        .style("font-family","Khand-Regular")
                        //.attr("font-weight","bold")
                        .style("fill","rgba(160,160,160,0.8)")
                        .attr("opacity",1)
            }
    }

    //添加播放按钮
    function addPlayButton(hasButton){
            d3.selectAll(".button_circle").remove()
            d3.selectAll(".button_stop").remove()
            d3.selectAll(".button_rect").remove()
        if(hasButton==false){
            return
        }
        button_center=[proj_world([157,0])[0],height*0.88]
            button_r=height/22

            //button的渐变填充

            let defs = svg.append("defs");

            let linearGradient = defs.append("linearGradient")
                                    .attr("id","linearColor")
                                    .attr("x1","0%")
                                    .attr("y1","0%")
                                    .attr("x2","80%")
                                    .attr("y2","0%");
             
            let stop1 = linearGradient.append("stop")
                            .attr("offset","0%")
                            .style("stop-color","rgb(200,200,200)");
             
            let stop2 = linearGradient.append("stop")
                            .attr("offset","100%")
                            .style("stop-color","white");


            var button_circle=svg.append("circle")
            .attr("class","button_circle")
              .attr("r", button_r)
              .attr("cx", button_center[0])
              .attr("cy",button_center[1])
              .on("click",function(d){
                //d3.selectAll(".button_stop").attr("fill-opacity",1);
                //button_stop.style("fill-opacity",1)
                //button_rect.style("fill-opacity",0)
                play_flag=(1-play_flag)
                if(play_flag==0){
                        d3.selectAll(".button_stop")
                            .attr("fill-opacity",0)
                         d3.selectAll(".button_rect")
                            .attr("fill-opacity",1)
                    }
                    else{
                        d3.selectAll(".button_stop")
                            .attr("fill-opacity",1)
                         d3.selectAll(".button_rect")
                            .attr("fill-opacity",0)
                    }
                console.log("circe "+play_flag)
                console.log("isEnd "+isEnd)
                if(isEnd==1){
                    isEnd=0;
                    play_flag=1;
                    console.log("isEnd "+isEnd)
                    console.log("start")
                    show_process(axis_start,axis_end);}
                //console.log(stop_year)
              })
              .attr("stroke","rgb(200,200,200)")
              .attr("stroke-width",3)
              //.attr("fill","rgb(245,245,245)")
              .style("fill","url(#" + linearGradient.attr("id") + ")")
              .style("fill-opacity",0.7);
            var button_stop=svg.append("rect")
                .attr("class","button_stop")
                .attr("x",button_center[0]-button_r*2/5)
                .attr("y",button_center[1]-button_r/2)
                .attr("width",button_r/5)
                .attr("height",button_r)
                .attr("fill","rgb(160,160,160)")
                .attr("fill-opacity",0)
                .on("click",function(d){
                    //d3.selectAll(".button_stop").attr("fill-opacity",1);
                    //button_stop.style("fill-opacity",1)
                    //button_rect.style("fill-opacity",0)
                    play_flag=(1-play_flag)
                    console.log("rect "+play_flag)
                    if(play_flag==0){
                        d3.selectAll(".button_stop")
                            .attr("fill-opacity",0)
                         d3.selectAll(".button_rect")
                            .attr("fill-opacity",1)
                    }
                    else{
                        d3.selectAll(".button_stop")
                            .attr("fill-opacity",1)
                         d3.selectAll(".button_rect")
                            .attr("fill-opacity",0)
                    }
                    if(isEnd==1){
                    isEnd=0;
                    play_flag=1;
                    show_process(axis_start,axis_end);}
              })

            var button_stop2=svg.append("rect")
                .attr("class","button_stop")
                .attr("x",button_center[0]+button_r/5)
                .attr("y",button_center[1]-button_r/2)
                .attr("width",button_r/5)
                .attr("height",button_r)
                .attr("fill","rgb(160,160,160)")
                .attr("fill-opacity",0)
                .on("click",function(d){
                    //d3.selectAll(".button_stop").attr("fill-opacity",1);
                    //button_stop.style("fill-opacity",1)
                    //button_rect.style("fill-opacity",0)
                    play_flag=(1-play_flag)
                    console.log("rect "+play_flag)
                    if(play_flag==0){
                        d3.selectAll(".button_stop")
                            .attr("fill-opacity",0)
                         d3.selectAll(".button_rect")
                            .attr("fill-opacity",1)
                    }
                    else{
                        d3.selectAll(".button_stop")
                            .attr("fill-opacity",1)
                         d3.selectAll(".button_rect")
                            .attr("fill-opacity",0)
                    }
                    if(isEnd==1){
                    isEnd=0;
                    play_flag=1;
                    show_process(axis_start,axis_end);}
              })

            var button_rect=svg.append("path")
                .attr("class","button_rect")
                .attr("d","M "+(button_center[0]+button_r/2)+","+(button_center[1])+" L"
                    +(button_center[0]-button_r/3)+","+(button_center[1]-button_r/2)+" L"
                    +(button_center[0]-button_r/3)+","+(button_center[1]+button_r/2))
                .attr("fill","rgb(160,160,160)")
                .on("click",function(d){
                    //d3.selectAll(".button_stop").attr("fill-opacity",1);
                    //button_stop.style("fill-opacity",1)
                    //button_rect.style("fill-opacity",0)
                    play_flag=(1-play_flag)
                    if(play_flag==0){
                        d3.selectAll(".button_stop")
                            .attr("fill-opacity",0)
                         d3.selectAll(".button_rect")
                            .attr("fill-opacity",1)
                    }
                    else{
                        d3.selectAll(".button_stop")
                            .attr("fill-opacity",1)
                         d3.selectAll(".button_rect")
                            .attr("fill-opacity",0)
                    }
                    console.log("san "+play_flag)
                    if(isEnd==1){
                        isEnd=0;
                    play_flag=1;
                    show_process(axis_start,axis_end);}
              })
    }

    function addDragBlock(){
        let slipBlockWidth=26*font_scale
        let slipBlockHeight=12*font_scale
        let dragFun = function () {
          // 获得被点击元素class
          var className = d3.select(this).attr('class');
          // 计算鼠标x坐标，要减去滑块宽度的二分之一
          var pos = d3.event.y - slipBlockHeight / 2;
          // 计算鼠标index，
          //var index = getIndex(pos);

          // 滑块只能在0到maxIndex之间滑动，即上层横条内
            if (pos >= timelineY-slipBlockHeight/2 && pos <= timelineY+timelineLen-slipBlockHeight*0.3) {
                    // 移动左滑块和相关背景和文字到鼠标位置
                    d3.select(".slide_rect")
                        .attr("y",pos)
                    let temp_gap=d3.event.y-timelineY+slipBlockHeight/2
                    if(is_date==1||is_data2axis==0){
                        temp_time=parseInt(countDate(axis_start,parseInt(temp_gap*(countGapDays(axis_start,axis_end))/timelineLen)).replaceAll("/",""));
                        if(temp_time>axis_end) temp_time=axis_end
                    }
                    else{
                        temp_time=axis_start+parseInt(temp_gap*(axis_end-axis_start)/timelineLen);  
                    }
                    //console.log(temp_time)
                    change_to_timerange(axis_start.toString(),temp_time)

            }
            }
            // 滑块拖动
            var slipBlockDrag = d3.drag()
                  .on('drag', dragFun);
            // 滑块元素调用拖拽方法
            d3.selectAll(".slide_rect").remove()
            let slipBlock=svg.append("rect")
                .attr("class","slide_rect")
                .attr("width",slipBlockWidth)
                .attr("height",slipBlockHeight)
                .attr("x",timelineX-slipBlockWidth/2)
                .attr("y",timelineY+timelineLen-slipBlockHeight/2)
                .attr("fill","rgb(160,160,160)")
                .attr("stroke","white")
                .attr("stroke-width",2*font_scale)
                .attr("pointer","cursor")
                .style("opacity",0.7)
            temp_time=axis_end.toString()
            d3.selectAll(".range_text")
                .text(date2str(temp_time))
            slipBlock.call(slipBlockDrag);
    }


//结束绘制，开始各种函数了
    
    //高亮
    function Highlight(temp_range){
            d3.selectAll(".country_num_text")
                .attr("opacity",0)
            //改变国家的颜色显示
            d3.select(".state")
                .selectAll("path")
                .attr("fill",function(d){
                    //console.log(d)
                    //console.log(2333)

                if(d.properties.hasData==1){
                    if(use_dragBlock==1){
                            let num0=0
                            let num1=d.properties.main_data[temp_time.toString()]
                            let brush_num=num1-num0
                            //if(d.properties.chinese_name=="中国") console.log(num1-num0)
                            //console.log(num1-num0)
                            if(brush_num<=temp_range.range[1]&&brush_num>=temp_range.range[0]) return color(temp_range.id)
                            else return "rgb(243,243,243)"
                    }
                    else return color(d.properties.stage)
                }
                else{
                    return "rgb(243,243,243)"
                }
                    
                });
            //改变连线的显示
            d3.selectAll(".links")
                .style("stroke-width",function(d,i){
                    //console.log(d)
                    if(d.stage==temp_range.id){
                        return 2*font_scale;
                    }
                    else{
                        return 0
                    }
                })
                .style("fill",function(d){
                if((Math.abs(d.target.x-d.source.x)<15||d.source.name=="Portugal")&&d.stage==temp_range.id) return "black"

             })
                .style("opacity",function(){
                    return 1
                 });
            d3.selectAll(".country_num_text")
                .attr("opacity",function(d,i){
                    if(use_dragBlock==1){
                            let num0=0
                            let num1=d.properties.main_data[temp_time.toString()]
                            let brush_num=num1-num0
                            //if(d.properties.chinese_name=="中国") console.log(num1-num0)
                            //console.log(num1-num0)
                            if(brush_num<=temp_range.range[1]&&brush_num>=temp_range.range[0]) return 1
                            else return 0
                    }
                    else return 0
                })
            //改变国家名字的显示
            d3.selectAll(".country_text")
                .style("fill-opacity",function(d,i){
                    if(use_dragBlock==1){
                            let num0=0
                            let num1=d.properties.main_data[temp_time.toString()]
                            let brush_num=num1-num0
                            //if(d.properties.chinese_name=="中国") console.log(num1-num0)
                            //console.log(num1-num0)
                            if(brush_num<=temp_range.range[1]&&brush_num>=temp_range.range[0]) return 
                            else return 0.2
                    }
                    else if(d.properties.stage==temp_range.id){
                        return 
                    }
                    else{
                        return 0.2
                    }
                })
            d3.selectAll(".country_text2")
                .style("fill-opacity",function(d,i){
                    if(use_dragBlock==1){
                            let num0=0
                            let num1=d.properties.main_data[temp_time.toString()]
                            let brush_num=num1-num0
                            //if(d.properties.chinese_name=="中国") console.log(num1-num0)
                            //console.log(num1-num0)
                            if(brush_num<=temp_range.range[1]&&brush_num>=temp_range.range[0]) return 
                            else return 0.2
                    }
                    else if(d.properties.stage==temp_range.id){
                        return 
                    }
                    else{
                        return 0.2
                    }
                })
            //改变传播地的圆圈的透明度
           d3.selectAll(".mycircle")
            .attr("r",function(d,i){
                if(d.stage==temp_range.id){
                        return 10*font_scale
                    }
                    else{
                        return 0.1
                    }
            })
            .style("fill-opacity",function(d,i){
                if(d.stage==temp_range.id) return 0.8
                    else return 0.1
            })
            .style("opacity",function(){
                    return 1
                 });
        }

        //恢复
        function Regain(temp_range){
            change_to_timerange(axis_start,temp_time)
            return true
            /*d3.select(".state")
                .selectAll("path")
            .attr("fill",function(d,i){
                        //console.log(d)
                        if(d.properties.stage=='null'){
                            if(selected_dataset=="policy"&&d.properties.chinese_name=="中国") return "rgba(210,210,210,1)"
                        }
                        else{
                            return color(d.properties.stage)
                        }
                    });
            //改变连线的显示
            d3.selectAll(".links")
                .style("stroke-width",function(d,i){
                })
                .style("fill",function(d){
                if((Math.abs(d.target.x-d.source.x)<15||d.source.name=="Portugal")&&d.stage==temp_range.id) return "black"

             })

            //改变国家名字的显示
            d3.selectAll(".country_text")
                .style("fill-opacity",function(d,i){
                    return 
                })
            d3.selectAll(".country_text2")
                .style("fill-opacity",function(d,i){
                    return 
                })

                //改变传播地的圆圈的透明度
           d3.selectAll(".mycircle")
            .attr("r",function(d,i){
                return 6*font_scale
            })
            .style("fill-opacity",function(d,i){
                return .4
            }) */

        }

    //判断两个地区是否有关联
    function hasRelation(a,b){

        for(var i=0;i<path_data.length;i++){
            //console.log(path_data[i].source.name)
            if(path_data[i].source.name==a.properties.name&&path_data[i].target.name==b.properties.name) return 1;
            if(path_data[i].source.name==b.properties.name&&path_data[i].target.name==a.properties.name) return 1;
        }
        return 0;
    }

    //刷选展示函数
    function display(){
        if(brush_flag<2){
            brush_flag+=1
            return
        }
        if(d3.event.selection==null){
            d3.selectAll(".states")//.selectAll("path")
            .style("fill",function(d,i){
                    //console.log(d)
                    if(d.properties.stage=='null'){
                        return "rgb(243,243,243)"
                    }
                    else{
                        return color(d.properties.stage)
                    }
                });

        d3.selectAll(".range_text")
            .style("fill","none")

            d3.selectAll(".country_text")
                .style("fill-opacity",function(d){
                    return .9
                })
            d3.selectAll(".country_text2")
                .style("fill-opacity",function(d){
                    return .9
                })
            d3.selectAll(".links")
                .style("stroke-width",function(d){
                        return 
                })
                .style("fill",function(d){
                if((Math.abs(d.target.x-d.source.x)<15||d.source.name=="Portugal")){
                    return "black"
                }
                })
            d3.selectAll(".mycircle")
                .attr("r",function(d,i){
                            return 6*font_scale

                })
                .style("fill-opacity",function(d,i){
                    return 0.4
                })

            return

        } 
        let s = d3.event.selection;
        //console.log(s)
        let s_0=s[0]-timelineY;
        let s_1=s[1]-timelineY;
        //console.log(s_0)
        //console.log(countDate(axis_start,parseInt(s_0*(axis_end-axis_start)/timelineLen)))
        if(is_date==1){
            year_0=parseInt(countDate(axis_start,parseInt(s_0*(axis_end-axis_start)/timelineLen)).replaceAll("/",""));
            year_1=parseInt(countDate(axis_start,parseInt(s_1*(axis_end-axis_start)/timelineLen)).replaceAll("/",""));
        }
        else{
            year_0=axis_start+parseInt(s_0*(axis_end-axis_start)/timelineLen);
            year_1=axis_start+parseInt(s_1*(axis_end-axis_start)/timelineLen);    
        }
        console.log([year_0,year_1])

        change_to_timerange(year_0,year_1)



    }

    function change_to_timerange(year_0,year_1){
        //console.log(year_0,year_1)
        d3.selectAll(".overview_country")
            .text(function(){
                            let t_country=0
                            if(map_data.overview.hasOwnProperty(year_1.toString())!=false) t_country=map_data.overview[year_1.toString()].country_num
                            if(temp_lan=="english") return overview_eng[0]+": "+t_country
                                else return overview_chinese[0]+": "+t_country
                        })
        d3.selectAll(".overview_num")
            .text(function(){
                            let t_num=0
                            if(map_data.overview.hasOwnProperty(year_1.toString())!=false) t_num=map_data.overview[year_1.toString()].data_sum
                            if(temp_lan=="english") return overview_eng[1]+": "+t_num
                                else return overview_chinese[1]+": "+t_num
                        })
        d3.selectAll(".country_num_text")
            .text(function(d){
                    let t_name= d.properties.chinese_name                            
                    if(t_name.length>=3&&t_name!="内蒙古"&&t_name!="黑龙江") return ""
                if(is_data2axis==0){
                            let num0=0
                            if(year_0!=axis_start){
                                let pre_date=countDate(axis_start,countGapDays(axis_start,parseInt(year_0))-1).replaceAll("/","")
                                num0=d.properties.main_data[pre_date]
                            }
                            let num1=d.properties.main_data[year_1.toString()]
                            let brush_num=num1-num0
                            if(isNaN(num1-num0)||num1-num0==0) return ""
                                else return num1-num0
                    }
            })
            .attr("opacity",1)
        d3.selectAll(".country_num_text_shadow")
            .text(function(d){
                    let t_name= d.properties.chinese_name                            
                    if(t_name.length>=3&&t_name!="内蒙古"&&t_name!="黑龙江") return ""
                if(is_data2axis==0){
                            let num0=0
                            if(year_0!=axis_start){
                                let pre_date=countDate(axis_start,countGapDays(axis_start,parseInt(year_0))-1).replaceAll("/","")
                                num0=d.properties.main_data[pre_date]
                            }
                            let num1=d.properties.main_data[year_1.toString()]
                            let brush_num=num1-num0
                            if(isNaN(num1-num0)||num1-num0==0) return ""
                                else return num1-num0
                    }
            })
            .attr("opacity",0.6)
        d3.select(".state")
            .selectAll("path")
            .attr("fill",function(d,i){
                    //console.log(d)
                    if(selected_dataset=="policy"){
                        if(d.properties.chinese_name=="中国") return "rgba(210,210,210,1)"
                        if(d.properties.hasData==1) return color(d.properties.stage)
                            else return "rgb(243,243,243)"
                        }
                    if(is_data2axis==0){
                            let num0=0
                            if(parseInt(year_0)!=axis_start){
                                let pre_date=countDate(axis_start,countGapDays(axis_start,parseInt(year_0))-1).replaceAll("/","")
                                num0=d.properties.main_data[pre_date]
                            }
                            let num1=d.properties.main_data[year_1.toString()]
                            let brush_num=num1-num0
                            //if(d.properties.chinese_name=="加拿大") console.log(num1-num0)
                            for(var k=0;k<data_range.length;k++){
                                if(brush_num<=data_range[k].range[1]&&brush_num>=data_range[k].range[0]){
                                    //if(d.properties.chinese_name=="加拿大") console.log(k)
                                    return color(k)
                                }
                            }

                    }
                    else if(is_date==1){
                        let temp_gap_days=countGapDays(start_date,d.properties.main_data)
                        if(temp_gap_days>=year_0&&temp_gap_days<=year_1){
                            return color(d.properties.stage)
                        }
                    }
                    else if(d.properties.main_data.length==5){
                        temp_year=parseInt(d.properties.main_data.substr(0,4))
                        if(temp_year>=year_0&&temp_year<=year_1){
                            //return color(4)
                            return color(d.properties.stage)
                        }
                    }
                    else if(d.properties.main_data>=year_0&&d.properties.main_data<=year_1){
                        //return color(4)
                        return color(d.properties.stage)
                    }                 
                    else return "rgb(243,243,243)"
                });
        d3.selectAll(".country_text")
                .style("fill-opacity",function(d){
                    if(selected_dataset=="policy"&&d.properties.hasData==1) return .9
                    if(is_data2axis==0){
                            let num0=0
                            if(parseInt(year_0)!=axis_start){
                                let pre_date=countDate(axis_start,countGapDays(axis_start,parseInt(year_0))-1).replaceAll("/","")
                                num0=d.properties.main_data[pre_date]
                            }
                            let num1=d.properties.main_data[year_1.toString()]
                            let brush_num=num1-num0
                            //console.log(num1-num0)
                            for(var k=0;k<data_range.length;k++){
                                if(brush_num<=data_range[k].range[1]&&brush_num>=data_range[k].range[0]) return .9
                            }
                        return 0

                    }
                    let temp_data=d.properties.main_data
                    if(is_date==1) temp_data=countGapDays(start_date,temp_data)
                    if(temp_data>=year_0&&temp_data<=year_1){
                        return .9
                    }
                    else return 0
                })
        d3.selectAll(".country_text2")
                .style("fill-opacity",function(d){
                    if(selected_dataset=="policy"&&d.properties.hasData==1) return .9
                    if(is_data2axis==0){
                        let num0=0
                            if(parseInt(year_0)!=axis_start){
                                let pre_date=countDate(axis_start,countGapDays(axis_start,parseInt(year_0))-1).replaceAll("/","")
                                num0=d.properties.main_data[pre_date]
                            }
                            let num1=d.properties.main_data[year_1.toString()]
                            let brush_num=num1-num0
                            //console.log(num1-num0)
                            for(var k=0;k<data_range.length;k++){
                                if(brush_num<=data_range[k].range[1]&&brush_num>=data_range[k].range[0]) return .9
                            }
                        return 0

                    }
                    let temp_data=d.properties.main_data
                    if(is_date==1) temp_data=countGapDays(start_date,temp_data)
                    if(temp_data>=year_0&&temp_data<=year_1){
                        return .9
                    }
                    else return 0
                })
        d3.selectAll(".range_text")
            .text(function(){
                if(use_dragBlock==1){
                        return date2str(year_1)

                }
                else if(is_date==1) return date2str(year_0)+"-"+date2str(year_1)
                return date2str(parseInt(year_0))+"-"+date2str(parseInt(year_1))
            })
            //.style("fill","white")
            .attr("opacity",1)
        if(hasPath==0) return true

        d3.selectAll(".links")
                .style("stroke-width",function(d){
                    return 0
                    if(is_data2axis==0){
                        return 0
                            /*let num0=d.properties.main_data[year_0.toString()]
                            let num1=d.properties.main_data[year_1.toString()]
                            let brush_num=num1-num0
                            //console.log(num1-num0)
                            for(var k=0;k<data_range.length;k++){
                                if(brush_num<=data_range[k].range[1]&&brush_num>=data_range[k].range[0]) return 2.3
                            }
                        return 0*/

                    }
                    let temp_data=d.main_data
                    //if(is_date==1) temp_data=countGapDays(start_date,temp_data)
                    if(temp_data>=year_0&&temp_data<=year_1){
                        return 2.3
                    }
                    else return 0
                })
                .style("fill",function(d){
                    if(is_data2axis==0){
                        return 
                            /*let num0=d.properties.main_data[year_0.toString()]
                            let num1=d.properties.main_data[year_1.toString()]
                            let brush_num=num1-num0
                            //console.log(num1-num0)
                            for(var k=0;k<data_range.length;k++){
                                if(brush_num<=data_range[k].range[1]&&brush_num>=data_range[k].range[0]) return ""
                            }*/

                    }
                    let temp_data=d.main_data
                        //if(is_date==1) temp_data=countGapDays(start_date,temp_data)
                    if((Math.abs(d.target.x-d.source.x)<15||d.source.name=="Portugal")){
                        if(temp_data>=year_0&&temp_data<=year_1) return "black"
                    }
                })
        d3.selectAll(".mycircle")
                .attr("r",function(d,i){
                    return 0
                    if(is_data2axis==0){
                        return 0
                            /*let num0=d.properties.main_data[year_0.toString()]
                            let num1=d.properties.main_data[year_1.toString()]
                            let brush_num=num1-num0
                            //console.log(num1-num0)
                            for(var k=0;k<data_range.length;k++){
                                if(brush_num<=data_range[k].range[1]&&brush_num>=data_range[k].range[0]) return 6*font_scale
                            }
                        return 0*/

                    }
                    let temp_data=d.main_data
                    //if(is_date==1) temp_data=countGapDays(start_date,temp_data)
                    if(temp_data<year_1&&temp_data>year_0){
                            return 6*font_scale
                    }
                    else{
                        return 0
                    }
                })
                .style("fill-opacity",function(d,i){
                    if(is_data2axis==0){
                        return 0
                            /*let num0=d.properties.main_data[year_0.toString()]
                            let num1=d.properties.main_data[year_1.toString()]
                            let brush_num=num1-num0
                            //console.log(num1-num0)
                            for(var k=0;k<data_range.length;k++){
                                if(brush_num<=data_range[k].range[1]&&brush_num>=data_range[k].range[0]) return 6*font_scale
                            }
                        return 0*/

                    }
                    let temp_data=d.main_data
                    //if(is_date==1) temp_data=countGapDays(start_date,temp_data)
                    if(temp_data<year_1&&temp_data>year_0) return 0.4
                        else return 0
                })
             d3.selectAll(".mouseover_text_1")
                .text("")
             d3.selectAll(".mouseover_text_2")
                .text("")
    }

    //选择国家显示详细信息
    function Showmessage(temp_country){
        isregain=0
        //console.log("show_message")

        dx_remark=width/60
        dy_remark=height/25
        let detail_text=""
                    if(is_data2axis==0){
                        if(temp_lan=="chinese"){
                            for(var k=0;k<data_keys.length;k++){
                                detail_text+=(data_key_chinese[k]+":"+temp_country.properties[data_keys[k]][axis_end.toString()]+" ")
                            }
                        }
                        else{
                            for(var k=0;k<data_keys.length;k++){
                                detail_text+=(data_key_eng[k]+":"+temp_country.properties[data_keys[k]][axis_end.toString()]+" ")
                            }
                        }
                    }
                        else detail_text=temp_country.properties.main_data
        //改变国家的颜色显示
        d3.select(".state")
            .selectAll("path")
            //.transition().duration(300)
            .attr("fill",function(d){
                //console.log(d)
                //console.log(2333)

                if(use_dragBlock==1 && temp_country.properties.main_data[temp_time.toString()]==0) return "rgb(243,243,243)"

                else if(hasRelation(d,temp_country)==1||d.properties.name==temp_country.properties.name){
                    if(use_dragBlock==1){
                            let num0=0
                            let num1=d.properties.main_data[temp_time.toString()]
                            let brush_num=num1-num0
                            //if(d.properties.chinese_name=="中国") console.log(num1-num0)
                            for(var k=0;k<data_range.length;k++){
                                if(brush_num<=data_range[k].range[1]&&brush_num>=data_range[k].range[0]) return color(k)
                            }
                    }
                    else if(d.properties.hasData==1) return color(d.properties.stage)
                        else return
                }
                else{
                    return "rgb(243,243,243)"
                }
                
            });

        
        //
        d3.selectAll(".viewrect")
            .attr("x", function () {
                if(temp_country.id!=""){
                var local = proj([temp_country.properties.cp[0], temp_country.properties.cp[1]]);
                //console.log(local[0]);
                return local[0]-temp_country.properties.name.split(" ")[0].length*3*font_scale+temp_country.properties.dx+dx_remark;
            }
            })
            .attr("y", function () {
                if(temp_country.id!=""){
                var local = proj([temp_country.properties.cp[0], temp_country.properties.cp[1]]);
                if(temp_country.properties.name=="Tanzania"||temp_country.properties.name=="Cuba"||temp_country.properties.name=="Portugal"||temp_country.properties.name=="Ivory Coast") return local[1]-dy_remark*1/3+temp_country.properties.dy
                return local[1]-dy_remark+temp_country.properties.dy;
            }
            })
            .attr("width",function(){
                let temp_scale=0.7
                if(temp_lan=="chinese"){
                    return (temp_country.properties.chinese_name.length*font_scale*19+(detail_text.length)*font_scale*9.5)*temp_scale
                }
                if(temp_country.properties.main_data.length==5) return (temp_country.properties.name.split(" ")[0].length+5 )*width/115*temp_scale;
                if(is_data2axis==1) return (temp_country.properties.name.split(" ")[0].length+temp_country.properties.main_data.toString().length)*font_scale*9.5*temp_scale
                else return (temp_country.properties.name.split(" ")[0].length+detail_text.length)*font_scale*8*temp_scale
            })
            .attr("height",function(){
                // if(temp_country.properties.name.split(" ").length>=2)
                if(temp_lan=="chinese") return height/23

                return height/25*(temp_country.properties.name.split(" ").length>=2?2:1)
            })
            .style("opacity",function(){
                if(use_dragBlock==1 && temp_country.properties.main_data[temp_time.toString()]==0) return 0
                return 0.3
            })


        d3.selectAll(".country_text")
            .style("fill-opacity",0)
        d3.selectAll(".country_text2")
            .style("fill-opacity",0)

        d3.selectAll(".mouseover_text_2")
            .attr("font-size",function(d,i){
                if(d.properties.name==temp_country.properties.name){
                    return width/80
                }
                else if(hasRelation(d,temp_country)==1){
                    return 12*font_scale
                }
                else return 0;
            })
            .attr("dx",function(d){
                let local=proj(d.properties.cp)
                if(d.properties.name==temp_country.properties.name){
                    if(local[0]+(d.properties.chinese_name.length+detail_text.length)*font_scale*15+dx_remark>width){
                        return width-local[0]-(d.properties.chinese_name.length+detail_text.length)*font_scale*15
                    }
                    return d.properties.dx+dx_remark;
                }
                else return d.properties.dx
            })
            .attr("dy",function(d){
                if(d.properties.name==temp_country.properties.name){
                    if(temp_country.properties.name=="Tanzania"||temp_country.properties.name=="Cuba"||temp_country.properties.name=="Portugal"||temp_country.properties.name=="Ivory Coast") return d.properties.dy+dy_remark*1/3
                    return d.properties.dy-dy_remark*0.6;
                }
                else return d.properties.dy
            })
            .text(function(d,i){
                if(use_dragBlock==1 && temp_country.properties.main_data[temp_time.toString()]==0) return ""
                if(temp_lan=="chinese"){
                    if(d.properties.hasData==1) return d.properties.chinese_name.split(" ")[1]
                    if(hasRelation(d,temp_country)==1){
                        return d.properties.chinese_name.split(" ")[1]
                }
                }
                if(d.properties.hasData==1) return d.properties.name.split(" ")[1]
                if(hasRelation(d,temp_country)==1){
                    return d.properties.name.split(" ")[1]
                }
            })
            .style("fill-opacity",function(d){
                if(hasPath==1&&hasRelation(d,temp_country)==1) return 1
                    if(d.properties.hasData==1&&d==temp_country) return 1
                        else return 0
            })
            .attr("font-size",function(d){
                if(d.properties.hasData==1&&d==temp_country) return 14*font_scale
                if(hasPath==1&&hasRelation(d,temp_country)==1){
                   return 12*font_scale
                }
            })
            ;
        d3.selectAll(".mouseover_text_1")
            .attr("font-size",function(d,i){
                if(d.properties.name==temp_country.properties.name){
                    return width/80
                }
                else if(hasRelation(d,temp_country)==1){
                    return 12*font_scale
                }
                else return 0;
            })
            .attr("dx",function(d){
                let local=proj(d.properties.cp)
                if(d.properties.name==temp_country.properties.name){
                    if(local[0]+(d.properties.chinese_name.length+detail_text.length)*font_scale*15+dx_remark>width){
                        return width-local[0]-(d.properties.chinese_name.length+detail_text.length)*font_scale*15
                    }
                    if(d.properties.chinese_name=="日本") return d.properties.dx+dx_remark-8*font_scale
                        else if(d.properties.chinese_name=="中国") return d.properties.dx+dx_remark-21*font_scale
                    return d.properties.dx+dx_remark;
                }
                else return d.properties.dx
            })
            .attr("dy",function(d){
                if(d.properties.name==temp_country.properties.name){
                    if(d.properties.chinese_name=="中国") return d.properties.dy-dy_remark
                    if(temp_country.properties.name=="Tanzania"||temp_country.properties.name=="Cuba"||temp_country.properties.name=="Portugal"||temp_country.properties.name=="Ivory Coast") return d.properties.dy
                    return d.properties.dy-dy_remark*2/3;
                }
                else return d.properties.dy
            })
            .text(function(d,i){
                if(use_dragBlock==1 && temp_country.properties.main_data[temp_time.toString()]==0) return ""
                if(temp_lan=="chinese"){
                    if(d.properties.hasData==1&&d==temp_country) return d.properties.chinese_name.split(" ")[0]+", "+detail_text
                    if(hasPath==1&&hasRelation(d,temp_country)==1){
                        return d.properties.chinese_name.split(" ")[0]
                }
                }
                if(d.properties.hasData==1&&d==temp_country) return d.properties.name.split(" ")[0]+", "+detail_text
                if(hasPath==1&&hasRelation(d,temp_country)==1){
                    return d.properties.name.split(" ")[0]
                }
            })
            .style("fill-opacity",1)
            .attr("font-size",function(d){
                if(d.properties.hasData==1&&d==temp_country) return 14*font_scale
                if(hasPath==1&&hasRelation(d,temp_country)==1){
                   return 12*font_scale
                }
            });
        d3.selectAll(".country_num_text")
            .attr("opacity",0)
        d3.selectAll(".country_num_text_shadow")
            .attr("opacity",0)

        //改变连线的显示
        d3.selectAll(".links")
            .style("stroke-width",function(d,i){
                //console.log(d)
                if(d.source.name==temp_country.properties.name||d.target.name==temp_country.properties.name){
                    return 2;
                }
                else{
                    return 0
                }
            })
            .style("fill",function(d){
                if((Math.abs(d.target.x-d.source.x)<15||d.source.name=="Portugal")){
                    if(d.source.name==temp_country.properties.name||d.target.name==temp_country.properties.name){
                    return "black"
                }
                }

             }).style("opacity",function(d){
                if(use_dragBlock==1 && d.date>temp_time) return 0
                return 1
            })
        //改变传播地的圆圈的透明度
       d3.selectAll(".mycircle")
        .attr("r",function(d,i){
            if(d.source.name==temp_country.properties.name||d.target.name==temp_country.properties.name){
                    return 10*font_scale
                }
                else{
                    return 0.1
                }
        })
        .style("fill-opacity",function(d,i){
            if(d.source.name==temp_country.properties.name||d.target.name==temp_country.properties.name) return 1
                else return 0
        })
        .style("opacity",function(d){
                if(use_dragBlock==1 && d.date>temp_time) return 0
                return 0.8
            })

    }

    //移开后恢复
    function Regainmessage(){
        isregain=1
        d3.selectAll(".viewrect")
            .style("fill-opacity",0)
        d3.selectAll(".mouseover_text_1")
            .style("fill-opacity",0)
        d3.selectAll(".mouseover_text_2")
            .style("fill-opacity",0)
        change_to_timerange(axis_start,temp_time)
        return true
        /*d3.select(".state")
            .selectAll("path")
        .transition().duration(500)
        .attr("fill",function(d,i){
                    //console.log(d)
                    if(d.properties.stage=='null'){
                    }
                    else{
                        return color(d.properties.stage)
                    }
                });

        d3.selectAll(".mouseover_text_1")
            .style("fill-opacity",0)
        d3.selectAll(".mouseover_text_2")
            .style("fill-opacity",0)
        d3.selectAll(".country_num_text")
            .style("opacity",1)
        d3.selectAll(".country_text")
            .attr("font-size",function(d,i){
                return 11*font_scale
            })
            .attr("dx",function(d,i){
                return d.properties.dx;

            })
            .attr("dy",function(d,i){
                    return d.properties.dy
            })
            .text(function(d,i){
                if(d.properties.hasData==1){
                    if(temp_lan=="chinese") return d.properties.chinese_name.split(" ")[0]
                    return d.properties.name.split(" ")[0]
                }
            })
            .attr("font-size", function(d,i){
                if(d.properties.main_data==1996) return 8*font_scale
                    else return 11*font_scale
            })
            .style("fill-opacity",1)
            ;
        d3.selectAll(".country_text2")
            .attr("font-size",function(d,i){
                return 11*font_scale
            })
            .attr("dx",function(d,i){
                return d.properties.dx;

            })
            .attr("dy",function(d,i){
                
                    return d.properties.dy
            })
            .text(function(d,i){
                if(d.properties.hasData==1){
                    if(temp_lan=="chinese") return ""
                    return d.properties.name.split(" ")[1]
                }
                    
            })
            .attr("font-size", function(d,i){
                if(d.properties.main_data==1996) return 8*font_scale
                    else return 11*font_scale
            })
            .style("fill-opacity",1);


        //改变连线的显示
        d3.selectAll(".links")
            .style("stroke-width",function(d,i){
            })
            .style("fill",function(d){
                if((Math.abs(d.target.x-d.source.x)<15||d.source.name=="Portugal")) return "black"
            })
            .style("opacity",show_path)


        //改变传播地的圆圈的透明度
        d3.selectAll(".mycircle")
            .attr("r",function(d,i){
                return 5*font_scale
            })
            .style("fill-opacity",function(d,i){
                return 1
            })
            .style("opacity",show_path)*/


    }


    //播放动画
    function show_process(start,end){
        //console.log(is_data2axis)
        let duration_time=0
        let animation_t=d3.timer(function(){
            d3.selectAll(".button_stop").attr("fill-opacity",1);
            if(change_view==1||parseInt(start) > end){//结束播放
                //console.log(start)
                console.log("end")
                isEnd=1;
                d3.selectAll(".button_rect")
                        .attr("fill-opacity",1)
                d3.selectAll(".button_stop").attr("fill-opacity",0);
                animation_t.stop();

                return true; 
            }
            if(show_detail==1){
                d3.selectAll(".country_num_text")
                    .transition()
                    .duration(duration_time)
                    .text(function(d){
                        if(is_data2axis==0){
                            let t_name=d.properties.chinese_name
                            if(t_name.length>2&&t_name!="内蒙古"&&t_name!="黑龙江") return ""
                            let brush_num=d.properties.main_data[parseInt(start).toString()]
                            if(isNaN(brush_num)||brush_num==0) return ""
                                else return brush_num
                        }
                    })
                d3.selectAll(".country_num_text_shadow")
                    .transition()
                    .duration(duration_time)
                    .text(function(d){
                        if(is_data2axis==0){
                            let t_name=d.properties.chinese_name
                            if(t_name.length>2&&t_name!="内蒙古"&&t_name!="黑龙江") return ""
                            let brush_num=d.properties.main_data[parseInt(start).toString()]
                            if(isNaN(brush_num)||brush_num==0) return ""
                                else return brush_num
                        }
                    })
            }
            //移动滑块，改变国家数量
            if(use_dragBlock==1){
                d3.selectAll(".slide_rect")
                .attr("y",function(d,i){
                    return timelineY+timelineLen*countGapDays(axis_start,start)/countGapDays(axis_start,axis_end)-8*font_scale
                })
                d3.selectAll(".overview_country")
                    .text(function(){
                                    let t_country=0
                                    if(map_data.overview.hasOwnProperty(parseInt(start).toString())!=false) t_country=map_data.overview[parseInt(start).toString()].country_num
                                    if(temp_lan=="english") return overview_eng[0]+": "+t_country
                                        else return overview_chinese[0]+": "+t_country
                                })
                d3.selectAll(".overview_num")
                    .text(function(){
                                    let t_num=0
                                    if(map_data.overview.hasOwnProperty(parseInt(start).toString())!=false) t_num=map_data.overview[parseInt(start).toString()].data_sum
                                    if(temp_lan=="english") return overview_eng[1]+": "+t_num
                                        else return overview_chinese[1]+": "+t_num
                                })
             }

            d3.select(".state")
                .selectAll("path")
                .transition()
                .duration(duration_time)
                .attr("fill",function(d,i){
                    if(d.properties.hasData==1){
                            if(is_data2axis==0){
                                let brush_num=d.properties.main_data[parseInt(start).toString()]
                                //if(d.properties.chinese_name=="中国") console.log(num1-num0)
                                for(var k=0;k<data_range.length;k++){
                                    if(brush_num<=data_range[k].range[1]&&brush_num>=data_range[k].range[0]) return color(k)
                                }
                                return 
                            }
                            if(d.properties.main_data.length==5){
                                temp_year=parseInt(d.properties.main_data.substr(0,4))
                                if(temp_year<start){
                                return color(d.properties.stage)
                            }}
                            if(d.properties.main_data<start){
                                return color(d.properties.stage)
                            }
                            else{
                                return "rgb(243,243,243)"
                            }
                        }
                        }); 
            //改变文字
            d3.selectAll(".country_text")
                .transition()
                .duration(duration_time)
                .style("opacity",function(d){
                    if(is_data2axis==0){
                         let brush_num=d.properties.main_data[parseInt(start).toString()]
                            //if(d.properties.chinese_name=="中国") console.log(num1-num0)
                         if (brush_num>0) return 1
                            else return 0
                    }
                    else if(d.properties.main_data.length==5){
                                temp_year=parseInt(d.properties.main_data.substr(0,4))
                                if(temp_year<start){
                                return 1
                            }}
                    if(d.properties.main_data<start) return 1
                    else return 0
                });
            d3.selectAll(".country_text2")
                .transition()
                .duration(duration_time)
                .style("fill-opacity",function(d){
                    if(is_data2axis==0){
                         let brush_num=d.properties.main_data[parseInt(start).toString()]
                            //if(d.properties.chinese_name=="中国") console.log(num1-num0)
                         if (brush_num>0) return 1
                            else return 0
                    }
                    else if(d.properties.main_data<start) return 1
                    else return 0
                })
            d3.selectAll(".mycircle")
                .transition()
                .duration(duration_time)
                .attr("r",function(d,i){
                    if(d.main_data<start){
                            return 6*font_scale
                    }
                    else{
                        return 0
                    }
                })
                .attr("fill-opacity",function(d,i){
                    if(d.main_data<start) return 1
                        else return 0
                })
        //改变连线的显示
        d3.selectAll(".links")
            .transition()
            .duration(duration_time)
            .style("fill",function(d){
                if((Math.abs(d.target.x-d.source.x)<15||d.source.name=="Portugal")){
                    if(d.main_data<=start) return "black"
                }
            })
            .style("stroke-width",function(d,i){
                //console.log(d)
                if(d.main_data==parseInt(start)){
                    return 2.5;
                }
                else if(d.main_data<start){
                    return 2
                }
                else{
                    return 0
                }
            })
            .style("opacity",function(d){
                if(d.main_data==parseInt(start)){
                    return 1;
                }
                else if(d.main_data<start){
                    //console.log(d.main_data)
                    return 1
                }
                else{
                    return 0
                }
            })

        d3.selectAll(".range_text")
            .text(date2str(axis_start)+"-"+date2str(parseInt(start)))
            //.style("fill","white")
            .style("opacity",1)
        let gap_num=axis_end-axis_start
            if(play_flag==0){
                d3.selectAll(".button_stop").attr("fill-opacity",0);
                start+=0
            }
            else if(is_data2axis==0){
                if(start<20200110){
                    start=start+0.2
                    if(start+0.2>parseInt(start)+1){
                    start=parseInt(countDate(parseInt(start),1).replaceAll("/",""))
                }
                }
                else start=start+0.05
                if(start+0.05>parseInt(start)+1){
                    start=parseInt(countDate(parseInt(start),1).replaceAll("/",""))
                }
            }
            /*else if(start<1920) start=start+0.1
            else if(start<1956) start+=3
            else if(start<1978) start+=0.1
            else if(start<1996) start+=0.03
            else if(start<2004) start+=0.1
            else start+=0.03*/
            else if(start<axis_start+gap_num*0.1){
                start=start+0.1
            }
            else if(start<axis_start+gap_num*0.3) start+=3
            else if(start<axis_start+gap_num*0.4) start+=0.1
            else if(start<axis_start+gap_num*0.6) start+=0.03
            else if(start<axis_start+gap_num*0.8) start+=0.1
            else start+=0.03       
        });
    }

    String.prototype.replaceAll = function(s1, s2) {
        return this.replace(new RegExp(s1, "gm"), s2);
    }

    //连线方式1
    function link(d) {
        local1=proj([d.source.x, d.source.y]);
        local2=proj([d.target.x, d.target.y]);
        circle_r=12*font_scale
        pm_x=0*font_scale
        pm_y=0*font_scale
        /*if(local1[0]>local2[0]) pm_x=-1
        if(local1[0]>local2[0]) pm_y=-1*/
       return "M" + (local1[0]) + "," + (local1[1])
      //+ "C" + (local1[0] + local2[0]) / 2 + "," + local1[1]
      + "S" + (8/9*local1[0] + local2[0]/9) + "," + (1/9*local1[1] + 8*local2[1]/9)
      + " " + (local2[0]-circle_r*pm_x) + "," + (local2[1]+2*pm_y);
    }

    //连线方式2
    function link_2(d) {
        local1=proj([d.source.x, d.source.y]);
        local2=proj([d.target.x, d.target.y]);
        circle_r=12*font_scale
        pm_x=0*font_scale
        pm_y=0*font_scale
        /*if(local1[0]>local2[0]) pm_x=-1
        if(local1[0]>local2[0]) pm_y=-1*/
       return "M" + (local1[0]) + "," + (local1[1])
      //+ "C" + (local1[0] + local2[0]) / 2 + "," + local1[1]
      + "S" + (1/4*local1[0] + 3*local2[0]/4) + "," + (3/4*local1[1] + local2[1]/4)
      + " " + (local2[0]-circle_r*pm_x) + "," + (local2[1]+2*pm_y);
    }

    //连线方式3
    function link_3(d) {
        local1=proj([d.source.x, d.source.y]);
        local2=proj([d.target.x, d.target.y]);
        circle_r=12*font_scale
        pm_x=0*font_scale
        pm_y=0*font_scale
        /*if(local1[0]>local2[0]) pm_x=-1
        if(local1[0]>local2[0]) pm_y=-1*/
       return "M" + (local1[0]) + "," + (local1[1])
      //+ "C" + (local1[0] + local2[0]) / 2 + "," + local1[1]
      + "S" + (1/4*local1[0] + 3*local2[0]/4) + "," + (8/9*local1[1] + local2[1]/9)
      + " " + (local2[0]) + "," + (local2[1]-28*pm_y);
    }

    function HideLeftView(){
        d3.select("#mapPanel").style("left","0%")
        document.getElementById("LeftSelectPanel").style.display="none"
        document.getElementById("hide_img").style.display="none"
        document.getElementById("show_img").style.display=""
    }
    function ShowLeftView(){
        d3.select("#mapPanel").style("left","15%")
        document.getElementById("LeftSelectPanel").style.display=""
        document.getElementById("hide_img").style.display=""
        document.getElementById("show_img").style.display="none"
    }

    //改变基础地图
    function changeBasicMap(mapFileName){
        play_flag=0
        /*change_view=1
        show_process(axis_start,axis_end)
        change_view=0*/
        selected_map=mapFileName
        temp_map=mapFileName
        if(selected_dataset=="nCoV"||selected_dataset=="ASF"){
            changeView(temp_map+"_"+selected_dataset+".json","path_"+selected_dataset+".json",temp_map+"_web_info_"+selected_dataset+".json")
        }
        else{
            changeView(temp_map+"_"+selected_dataset+".json","",temp_map+"_web_info_"+selected_dataset+".json")
        }
    }

    function changeDataSet(datasetName){
        play_flag=0
        /*change_view=1
        show_process(axis_start,axis_end)
        change_view=0*/
        selected_dataset=datasetName
        if(selected_dataset=="nCoV"||selected_dataset=="ASF"){
            changeView(temp_map+"_"+selected_dataset+".json","path_"+selected_dataset+".json",temp_map+"_web_info_"+selected_dataset+".json")
        }
        else{
            changeView(temp_map+"_"+selected_dataset+".json","",temp_map+"_web_info_"+selected_dataset+".json")
        }

    }

    getMapData()
    let hubeiMap={}
    function getMapData(){
        let chinaMap
        let chinaData
        d3.json("chinamap/china_countries_bilingual.json",function(temp_map_data){
                //console.log(data)
                chinaMap=temp_map_data
                d3.csv("https://tanshaocong.github.io/2019-nCoV/data.csv",function(data){
                //console.log(data)
                    chinaData=data
                    let province_num=0
                    //中国的数据范围
                    let china_data_range=[1,50,100,500,1000,2000,30000]
                    let pre_num=0
                    let temp_dates=Object.keys(chinaData[0])
                    let update_day=parseInt(temp_dates[temp_dates.length-1].split("月")[1].split("日")[0])
                    chinaMap["overview"]={}
                    for(var i=1;i<temp_dates.length;i++){
                        chinaMap["overview"][date_chinese2eng(temp_dates[i])]={
                            "data_sum": 0,
                            "country_num": 0
                        }
                    }
                    for(var i=0;i<chinaMap.features.length;i++){
                        temp_province=chinaMap.features[i]
                        chinaMap["features"][i]["properties"]["main_data"]={}
                        pre_num=0
                        for(var j=0;j<chinaData.length;j++){
                            if(chinaData[j].time==temp_province.properties.chinese_name){
                                //console.log(chinaData[j])
                                let t_data=chinaData[j]
                                for(var key in t_data){
                                    if(key=="time") continue
                                    chinaMap["features"][i]["properties"]["hasData"]=1
                                    pre_num=pre_num+parseInt(t_data[key])
                                    chinaMap["features"][i]["properties"]["main_data"][date_chinese2eng(key)]=pre_num
                                    chinaMap["overview"][date_chinese2eng(key)]["data_sum"]+=pre_num
                                    if(pre_num>0)
                                        chinaMap["overview"][date_chinese2eng(key)]["country_num"]+=1
                                    for(var k=0;k<china_data_range.length-1;k++){
                                        if(pre_num>=china_data_range[k] && pre_num<china_data_range[k+1]){
                                            chinaMap["features"][i]["properties"]["stage"]=k
                                            break
                                        }
                                    }
                                    if(temp_province.properties.chinese_name=="湖北"){
                                        chinaMap["features"][i]["properties"]["main_data"][date_chinese2eng(key)]=0
                                        chinaMap["features"][i]["properties"]["stage"]=null
                                        chinaMap["features"][i]["properties"].hasData=0
                                    }
                                }
                                continue
                            }
                        }
                        let t_dx=0
                        let t_dy=0
                        if(temp_province.properties.chinese_name=="北京") t_dy=-10

                        if(temp_province.properties.chinese_name=="广东") t_dy=-10
                        chinaMap["features"][i]["properties"]["dx"]=t_dx
                        chinaMap["features"][i]["properties"]["dy"]=t_dy
                        //console.log(chinaMap["features"][i].properties)
                    }
                    getMapDataAll()
                    setTimeout(function(){
                        for(var i=0;i<hubeiMap.features.length;i++){
                            chinaMap.features.push(hubeiMap.features[i])
                        }
                        console.log(chinaMap)
                        createChinaMap(chinaMap,chinaData) 
                    },1500)                     
                    /*svg.append("rect")
                        .attr("id","back_rect")
                            .attr("width",width)
                            .attr("height",height)
                            .attr("x",0)
                            .attr("y",0)
                            .on("click",function()
                            {
                                //console.log("click")
                                getMapData()
                            })
                            //.attr("fill","rgb(255,255,255)")
                            .style("fill","rgb(220,220,220)")
                            .style("opacity",0.0)
                            .attr("cursor","pointer")
                            })*/
            })
        
    })
    }
    function createChinaMap(chinaMap,chinaData){
        //console.log(chinaData)
        let province_num=0
        //中国的数据范围
        //let china_data_range=[1,40,80,160,320,640,30000]
                    let china_data_range=[1,50,100,500,1000,2000,30000]
        let pre_num=0
        let temp_dates=Object.keys(chinaData[0])
        let update_day=parseInt(temp_dates[temp_dates.length-1].split("月")[1].split("日")[0])
        //给地图数据赋值
        map_data=chinaMap
        path_data=""
        //给component数据赋值
        let temp_components={
            "web_title":
                "nCoV: Chinese Spread since 2019/12/31",
            "chinese_title":
                "新型冠状病毒感染肺炎疫情: 中国传播态势",
            "sub_tiltle":
                "Up to February "+update_day+"th",
            "sub_tiltle_chinese":
                "数据截止至2月"+update_day+"日24时", 
            "data_range":
                [{"name":china_data_range[0]+"-"+(china_data_range[1]-1),"id":0,"range":[china_data_range[0],china_data_range[1]-1]},
                {"name":china_data_range[1]+"-"+(china_data_range[2]-1),"id":1,"range":[china_data_range[1],china_data_range[2]-1]},
                {"name":china_data_range[2]+"-"+(china_data_range[3]-1),"id":2,"range":[china_data_range[2],china_data_range[3]-1]},
                {"name":china_data_range[3]+"-"+(china_data_range[4]-1),"id":3,"range":[china_data_range[3],china_data_range[4]-1]},
                {"name":china_data_range[4]+"-"+(china_data_range[5]-1),"id":4,"range":[china_data_range[4],china_data_range[5]-1]},
                {"name":china_data_range[5]+"-"+china_data_range[6],"id":5,"range":[china_data_range[5],china_data_range[6]]}],
            "axis_range":
                [20191231,parseInt(date_chinese2eng(temp_dates[temp_dates.length-1]))],
            "unit":"",
            "chinese_unit":"",
            "chinese_unit":"",
            "data_point":
                [{"year":20191231,"event":"Report of pneumonia with unknown causes in China","chinese_event":"武汉出现不明原因肺炎病人"},
                {"year":20200111,"event":"Report of 41 confirmed cases in China","chinese_event":"中国武汉确诊41例新型冠状病毒"},
                {"year":20200119,"event":"First detected in Beijing, Guangdong","chinese_event":"首次在湖北以外省份确诊"},
                {"year":20200131,"event":"More than 10000 cases confirmed","chinese_event":"全国确诊人数超10000"}],
            "is_date_data":0,
            "is_data2axis":0,
            "show_detail":1,
            "show_path":0,
            "use_brush":0,
            "use_dragBlock":1,
            "use_date_axis":1,
            "dataSource":
                "National Health Commission of the People's Republic of China",
            "dataSource_chinese":
                "卫生健康委员会",
            "data_url":
                "https://www.baidu.com/link?url=WzGUlrQ4_bEHBWxkIIYsStz40oAB7OgZtaaw-yqlc_e&wd=&eqid=effd5e710029d9dc000000065e323f58",
            "mapSource":
                "github.com/iWun/china_geojson",
            "map_url":
                "https://github.com/iWun/china_geojson"

        }
        getComponentData(temp_components)
        console.log(temp_components)
        proj=proj_china
        path = d3.geoPath().projection(proj);
        hasPath=1
        getPathData("path_china_nCoV.json")
        /*overview_eng=["Counties","Confirmed"]
        overview_chinese=["城市","确诊"]
        data_key_eng=["main_data","cure_data","death_data"]
        data_key_chinese=["城市","确诊"]*/

        setTimeout(function(){ 
                addMap()
                addMapStatistic()
                addRangeRect()
                addOtherInfo()
                addPlayButton(true)
                addAxis() 
                addPath(true)
                addDistrictName()
            changeLanChinese()
            change_to_timerange(axis_start,axis_end)
            }, 500);

    }

    //生成全中国的数据
    //getMapDataAll()
    function getMapDataAll(){
        //let hubeiMap={}
        let chinaData
        d3.json("chinamap/hubei_bilingual.json",function(temp_map_data){
                //console.log(data)
                hubeiMap=temp_map_data
                d3.csv("https://tanshaocong.github.io/2019-nCoV/map.csv",function(data){
                //console.log(data)
                    chinaData=data
                    createHubeiMap(chinaData)
                    //console.log(hubeiMap)
                })
            })
    }
    function  createHubeiMap(chinaData){
        //console.log(chinaData)
        let province_num=0
        //中国的数据范围
        let china_data_range=[1,40,80,160,320,640,30000]
        let pre_num={}
        let pre_cure={}
        let pre_death={}
        let start_date=date_chinese2eng(chinaData[0]["公开时间"])
        let end_date=date_chinese2eng(chinaData[chinaData.length-1]["公开时间"])
        let update_day=parseInt(chinaData[chinaData.length-1]["公开时间"].split("月")[1].split("日")[0])

        hubeiMap["overview"]={}
        for(var i=parseInt(start_date);i<=parseInt(end_date);){
            hubeiMap["overview"][i]={
                "data_sum": 0,
                "country_num": 0
            }
            i=countDate(i,1).replaceAll("/","")
        }
        for(var i=0;i<hubeiMap.features.length;i++){
            let t_county=hubeiMap.features[i].properties.chinese_name.substr(0,2)
            pre_num[t_county]=0
            pre_cure[t_county]=0
            pre_death[t_county]=0
            hubeiMap.features[i].properties.main_data={}
            hubeiMap.features[i].properties.cure_data={}
            hubeiMap.features[i].properties.death_data={}
        }
        for(var i=0;i<chinaData.length;i++){
            //console.log(parseInt(""))
            let temp_province=chinaData[i]["省份"]
            let t_county=chinaData[i]["城市"]
            if(temp_province!="湖北") continue
            for(var j=0;j<hubeiMap.features.length;j++){
                if(hubeiMap.features[j].properties.chinese_name.substr(0,2)==t_county.substr(0,2)){
                    //console.log(chinaData[j])
                    t_county=t_county.substr(0,2)
                    let temp_record=chinaData[i]
                    let t_time=date_chinese2eng(temp_record["公开时间"])
                    let t_data=temp_record["新增确诊病例"]
                        if(t_data!=""&&t_data!="0") pre_num[t_county]+=parseInt(t_data)
                    let t_cure=temp_record["新增治愈出院数"]
                        if(t_cure!=""&&t_cure!="0") pre_cure[t_county]+=parseInt(t_cure)
                    let t_dead=temp_record["新增死亡数"]
                        if(t_dead!=""&&t_dead!="0") pre_death[t_county]+=parseInt(t_dead)
                        hubeiMap["features"][j]["properties"]["hasData"]=1
                    if(isNaN(pre_num[t_county])==true) console.log(temp_record)
                        hubeiMap["features"][j]["properties"]["main_data"][t_time]=pre_num[t_county]
                        hubeiMap["features"][j]["properties"]["cure_data"][t_time]=pre_cure[t_county]
                        hubeiMap["features"][j]["properties"]["death_data"][t_time]=pre_death[t_county]
                        hubeiMap["overview"][t_time]["data_sum"]+=pre_num[t_county]
                        if(pre_num[t_county]>0)
                            hubeiMap["overview"][t_time]["country_num"]+=1
                        for(var k=0;k<china_data_range.length-1;k++){
                            if(pre_num[t_county]>=china_data_range[k] && pre_num[t_county]<china_data_range[k+1]){
                                hubeiMap["features"][j]["properties"]["stage"]=k
                                break
                            }
                        let t_dx=0
                        let t_dy=0
                        hubeiMap["features"][j]["properties"]["dx"]=t_dx
                        hubeiMap["features"][j]["properties"]["dy"]=t_dy
                    }
                    break
                }
            }
            //console.log(chinaMap["features"][i].properties)
        }
        for(var i=0;i<hubeiMap.features.length;i++){
            let pre_cure=0
            let pre_data=0
            let pre_death=0
            for(var j=parseInt(start_date);j<=parseInt(end_date);){
                if(hubeiMap.features[i].properties.main_data.hasOwnProperty(j)==false)
                    hubeiMap.features[i].properties.main_data[j]=pre_data
                else
                    pre_data=hubeiMap.features[i].properties.main_data[j]
                if(hubeiMap.features[i].properties.cure_data.hasOwnProperty(j)==false)
                    hubeiMap.features[i].properties.cure_data[j]=pre_cure
                else
                    pre_cure=hubeiMap.features[i].properties.cure_data[j]
                if(hubeiMap.features[i].properties.death_data.hasOwnProperty(j)==false)
                    hubeiMap.features[i].properties.death_data[j]=pre_death
                else
                    pre_death=hubeiMap.features[i].properties.death_data[j]
                j=countDate(j,1).replaceAll("/","")
            }
        }

        //map_data=hubeiMap
        return true
        //addMap("new")
        //给地图数据赋值
        /*
        map_data=hubeiMap
        path_data=""
        //给component数据赋值
        let temp_components={
            "web_title":
                "nCoV: Chinese Spread since 2019/12/31",
            "chinese_title":
                "新型冠状病毒感染肺炎疫情: 中国传播态势",
            "sub_tiltle":
                "Up to February "+update_day+"th",
            "sub_tiltle_chinese":
                "数据截止至2月"+update_day+"日24时", 
            "data_range":
                [{"name":china_data_range[0]+"-"+(china_data_range[1]-1),"id":0,"range":[china_data_range[0],china_data_range[1]-1]},
                {"name":china_data_range[1]+"-"+(china_data_range[2]-1),"id":1,"range":[china_data_range[1],china_data_range[2]-1]},
                {"name":china_data_range[2]+"-"+(china_data_range[3]-1),"id":2,"range":[china_data_range[2],china_data_range[3]-1]},
                {"name":china_data_range[3]+"-"+(china_data_range[4]-1),"id":3,"range":[china_data_range[3],china_data_range[4]-1]},
                {"name":china_data_range[4]+"-"+(china_data_range[5]-1),"id":4,"range":[china_data_range[4],china_data_range[5]-1]},
                {"name":china_data_range[5]+"-"+china_data_range[6],"id":5,"range":[china_data_range[5],china_data_range[6]]}],
            "axis_range":
                [20191231,end_date],
            "unit":"",
            "chinese_unit":"",
            "chinese_unit":"",
            "data_point":
                [{"year":20191231,"event":"Report of pneumonia with unknown causes in China","chinese_event":"武汉出现不明原因肺炎病人"},
                {"year":20200111,"event":"Report of 41 confirmed cases in China","chinese_event":"中国武汉确诊41例新型冠状病毒"},
                {"year":20200119,"event":"First detected in Beijing, Guangdong","chinese_event":"首次在湖北以外省份确诊"},
                {"year":20200131,"event":"More than 10000 cases confirmed","chinese_event":"全国确诊人数超10000"}],
            "is_date_data":0,
            "is_data2axis":0,
            "show_detail":1,
            "show_path":0,
            "use_brush":0,
            "use_dragBlock":1,
            "use_date_axis":1,
            "dataSource":
                "National Health Commission of the People's Republic of China",
            "dataSource_chinese":
                "卫生健康委员会",
            "data_url":
                "https://www.baidu.com/link?url=WzGUlrQ4_bEHBWxkIIYsStz40oAB7OgZtaaw-yqlc_e&wd=&eqid=effd5e710029d9dc000000065e323f58",
            "mapSource":
                "github.com/iWun/china_geojson",
            "map_url":
                "https://github.com/iWun/china_geojson"

        }
        getComponentData(temp_components)
        console.log(temp_components)
        proj=proj_hubei
        path = d3.geoPath().projection(proj);
        setTimeout(function(){ 
                addMap()
                addMapStatistic()
                addRangeRect()
                //addOtherInfo()
                //addPlayButton(true)
                //addAxis() 
                addPath(false)
                addDistrictName()
            changeLanChinese()
            }, 500);*/
    }
    //将中文格式的日期转换
    function date_chinese2eng(date_str){
        let eng_str="2020"
        let m=date_str.split("月")[0]
        let d=date_str.split("月")[1].split("日")[0]
        if(m<10) eng_str+=("0"+m)
            else eng_str+=m
        if(d<10) eng_str+=("0"+d)
            else eng_str+=d
        return eng_str
    }

    function changeView(mapDataFile,pathDataFile,componentDataFile){
        //console.log(mapDataFile)
        //console.log(pathDataFile)
        //console.log(componentDataFile)
        let timeout=1500
        if(selected_dataset=="policy") timeout=3000
        if(temp_map=="china"){
            proj=proj_china
            path = d3.geoPath().projection(proj);
        }
        else{
            proj=proj_world
            path = d3.geoPath().projection(proj);
        }
            getMapData(mapDataFile)
            if(pathDataFile!=""){
                getPathData(pathDataFile)
                hasPath=1
            }
                else{
                    hasPath=0
                    path_data={}
                }
            d3.json(componentDataFile, function (error, components) {
                getComponentData(components)
            })
            setTimeout(function(){ 
                addMap()
                addMapStatistic()
                addRangeRect()
                addOtherInfo()
                if(selected_dataset=="policy")
                    addPlayButton(false)
                else
                    addPlayButton(true)
                addAxis() 
                if(pathDataFile!="") addPath(true)
                    else addPath(false)
                addDistrictName()
            changeLanChinese()
            }, timeout);

    }

    //改变地图关联的数据
    function changeMapData(dataFileName){

    }

    //改变连线关联的数据
    function changePathData(pathFileName){

    }

    //改变连线颜色的函数
    function changeLineColor(lineColorValue){
        //let tempLineColor="black"
        //if(lineColorValue==0) tempLineColor="yellow"
            //console.log("tempLineColor"+tempLineColor)
        var arrowMarker = d3.select("#arrow")
                        
        arrowMarker.select("path")
            .attr("fill",lineColorValue)
            .attr("fill-opacity",0.7);
        d3.selectAll(".links")
                .style("stroke-width",function(d){
                        return 
                })
                .style("fill",function(d){
                if((Math.abs(d.target.x-d.source.x)<15||d.source.name=="Portugal")){
                    return "black"
                }
                })
                .style("stroke",lineColorValue)
                .attr("stroke-opacity",0.7)
                .attr("marker-end","url(#arrow)")
    }
    //改变圆圈的颜色
    function changeCircleColor(circleColorValue){
        d3.selectAll(".mycircle")
            .attr("fill",function(d,i){
                return circleColorValue
            })
            .style("fill-opacity",function(d,i){
                return 1
            })
    }
    //改变网页的中英文显示
    function changeLanChinese(){
        
            temp_lan="chinese"
            $(".titleText").text("北京大学地图可视化")
            d3.selectAll(".country_text")
                .text(function(d){
                    let t_name= d.properties.chinese_name                            
                    if(t_name.length>=3&&t_name!="内蒙古"&&t_name!="黑龙江") return ""
                    if(d.properties.hasData==1) return d.properties.chinese_name
                    else return ""
                })
            d3.selectAll(".country_text2")
                .text(function(d){
                    let t_name= d.properties.chinese_name                            
                    if(t_name.length>=3&&t_name!="内蒙古"&&t_name!="黑龙江") return ""
                    return ""
                })
            d3.selectAll(".mouseover_text_1")
                .text(function(d){
                    return ""
                })
            d3.selectAll(".mouseover_text_2")
                .text(function(d){
                    return ""
                })
            d3.selectAll(".country_num_text")
                .attr("y",function(d){
                    if(d.properties.cp==0) return ;
                    if(d.id!=""){
                    var local = proj([d.properties.cp[0], d.properties.cp[1]]);
                    return local[1]+18*font_scale;
                }
                })
            d3.selectAll(".country_num_text_shadow")
                .attr("y",function(d){
                    if(d.properties.cp==0) return ;
                    if(d.id!=""){
                    var local = proj([d.properties.cp[0], d.properties.cp[1]]);
                    return local[1]+18*font_scale;

                }
                })

            d3.selectAll(".point_text")
                .text(function(d,i){
                    if (d.chinese_event.split(":").length==2) return d.chinese_event.split(":")[1]
                    if(is_data2axis==0) return date2str(d.year)+chineses_unit+": "+d.chinese_event;
                    else return d.year+chineses_unit+": "+d.chinese_event;
                });
            d3.selectAll(".source1")
                .text("数据来源: "+dataSource_chinese)
            d3.selectAll(".source2")
                .text("地图数据来源: "+mapSource)
            d3.selectAll(".shadow_title")
                  .text(chinese_title);
            d3.selectAll(".title")
                .text(chinese_title)
            d3.selectAll(".subtitle")
                .text(sub_tiltle_chinese)
            if(use_dragBlock==1){
                d3.selectAll(".overview_country")
                    .text(function(){
                                    let t_country=0
                                    if(map_data.overview.hasOwnProperty(temp_time.toString())!=false) t_country=map_data.overview[temp_time.toString()].country_num
                                    return overview_chinese[0]+": "+t_country
                                })
                d3.selectAll(".overview_num")
                    .text(function(){
                                    let t_num=0
                                    if(map_data.overview.hasOwnProperty(temp_time.toString())!=false) t_num=map_data.overview[temp_time.toString()].data_sum
                                    return overview_chinese[1]+": "+t_num
                                })
             }


    }
    function changeLanEnglish(){

            temp_lan="english"
            $(".titleText").text("Map Visualization Library")
            d3.selectAll(".country_text")
                .text(function(d){
                    if(d.properties.hasData==1) return d.properties.name.split(" ")[0]
                    else return ""
                })
            d3.selectAll(".country_text2")
                .text(function(d){
                    if(d.properties.hasData==1) return d.properties.name.split(" ")[1]
                    return ""
                })
            d3.selectAll(".country_num_text")
                .attr("y",function(d){
                    if(d.properties.cp==0) return ;
                    if(d.id!=""){
                    var local = proj([d.properties.cp[0], d.properties.cp[1]]);
                    if((d.properties.name.split(" ").length==1)) return local[1]+18*font_scale;
                    else return local[1]+28*font_scale;
                }
                })
            d3.selectAll(".country_num_text_shadow")
                .attr("y",function(d){
                    if(d.properties.cp==0) return ;
                    if(d.id!=""){
                    var local = proj([d.properties.cp[0], d.properties.cp[1]]);
                    if((d.properties.name.split(" ").length==1)) return local[1]+18*font_scale;
                    else return local[1]+28*font_scale;
                }
                })

            d3.selectAll(".point_text")
                .text(function(d,i){
                    if (d.chinese_event.split(":").length==2) return d.event.split(":")[1]
                    if(is_data2axis==0) return date2str(d.year)+num_unit+": "+d.event;
                    else return d.year+num_unit+": "+d.event;
                });
            d3.selectAll(".source1")
                .text("Data Source: "+dataSource)
            d3.selectAll(".source2")
                .text("Map Source: "+mapSource)
            d3.selectAll(".shadow_title")
                  .text(web_title);
            d3.selectAll(".title")
                .text(web_title)
            d3.selectAll(".subtitle")
                .text(sub_tiltle)
            if(use_dragBlock==1){
                d3.selectAll(".overview_country")
                    .text(function(){
                                    let t_country=0
                                    if(map_data.overview.hasOwnProperty(temp_time.toString())!=false) t_country=map_data.overview[temp_time.toString()].country_num
                                    return "Countries: "+t_country
                                })
                d3.selectAll(".overview_num")
                    .text(function(){
                                    let t_num=0
                                    if(map_data.overview.hasOwnProperty(temp_time.toString())!=false) t_num=map_data.overview[temp_time.toString()].data_sum
                                    return "Confirmed: "+t_num
                                })
             }

        
    }

    //改成带斜线的日期格式
    function date2str(int_date){
        if(is_data2axis==1) return int_date
        int_date=int_date.toString()
        let date_str=""
        date_str+=(int_date.substr(0,4)+"/")      
        date_str+=(int_date.substr(4,2)+"/")      
        date_str+=(int_date.substr(6,2))
        return date_str
    }

    //根据时间轴的开始日期和中间间隔的天数计算出对应的日期
    function countDate(start_date,gap_days){
        let month_days=[0,31,28,31,30,31,30,31,31,30,31,30,31]
        let temp_year=Math.floor(start_date/10000)
        let temp_month=Math.floor((start_date%10000)/100)
        let temp_day=start_date%100
        while(gap_days>0){
            let temp_year_day=365
            let temp_month_day=month_days[temp_month]
            if(temp_month==2&&isLeapYear(temp_year)==1) temp_month_day=29
            if(temp_month<=2&&isLeapYear(temp_year)==1){
                if(temp_month==2){
                    if(temp_day<=28) temp_year_day=366
                    else temp_day=28
                }
                else temp_year_day=366
            }
            if(gap_days>=temp_year_day){
                temp_year+=1
                gap_days-=temp_year_day
            }
            else{
                let left_month_day=temp_month_day-temp_day
                if(gap_days>left_month_day){
                    temp_month+=1
                    temp_day=1
                    if(temp_month==13){
                        temp_year+=1
                        temp_month=1
                    }
                    gap_days-=(left_month_day+1)
                }
                else{
                    temp_day+=gap_days
                    gap_days=0
                }
            }
        }
        if(temp_month<10) temp_month="0"+temp_month
        if(temp_day<10) temp_day="0"+temp_day
        return temp_year+"/"+temp_month+"/"+temp_day
    }

    //计算两个日期之间的间隔天数
    //日期的记录格式为20180101
    function countGapDays(date0,date1){
        let month_days=[0,31,28,31,30,31,30,31,31,30,31,30,31]
        let year0=Math.floor(date0/10000)
        let month0=Math.floor((date0%10000)/100)
        let day0=date0%100
        let year1=Math.floor(date1/10000)
        let month1=Math.floor((date1%10000)/100)
        let day1=date1%100
        //console.log("date0:"+year0+":"+month0+":"+day0)
        //console.log("date1:"+year1+":"+month1+":"+day1)
        let temp_gap_days=0
        //中间的年份有多少天
        for(var mid_year=year0+1;mid_year<year1;mid_year++){
            if(isLeapYear(mid_year)) temp_gap_days+=366
            else temp_gap_days+=365
        }
        //如果是同一年
        if(year1==year0){
            if(month0==month1){
                temp_gap_days=temp_gap_days+(day1-day0)
            }
            else for(var temp_month=month0;temp_month<=month1;temp_month++){
                let gap_month_day=month_days[temp_month]
                if(isLeapYear(year0)&&temp_month==2) gap_month_day=29
                if(temp_month==month0) gap_month_day-=day0
                    else if(temp_month==month1) gap_month_day=day1
                temp_gap_days+=gap_month_day
            }
        }
        //如果不是同一年
        else{
            for(var i=month0;i<=12;i++){
                let gap_month_day=month_days[i]
                if(i==2&&isLeapYear(year0)) gap_month_day=29
                if(i==month0) gap_month_day-=day0
                temp_gap_days+=gap_month_day
            }
            for(var i=1;i<=month1;i++){
                let gap_month_day=month_days[i]
                if(i==2&&isLeapYear(year0)) gap_month_day=29
                if(i==month1) gap_month_day=day1
                temp_gap_days+=gap_month_day
            }
        }
        //console.log("temp_gap_days ",temp_gap_days)
        return temp_gap_days
    }

    //判断某个年份是否为闰年
    function isLeapYear(temp_year){
        if(temp_year%100==0){
            if(temp_year%400==0) return 1
        }
        else if(temp_year%4==0){
            return 1
        }
        return 0
    }

