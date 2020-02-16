//开始进行数据定义
    let self=this

    let data_keys=["main_data"]
    let data_key_chinese=["确诊"]
    let data_key_eng=["cases"]

    let overview_chinese=["省份","确诊"]
    let overview_eng=["Provinces","Confirmed"]

    var brush_flag=0;
    let inTimeRect=0;
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

    let province_confirm_num={}
    let county_confirm_num={}
    let county_order={}
    let county_id={}

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
    let temp_lan="chinese"
    let temp_map="china"

    //宽度
    let width=$('#mapPanel').width()
    //高度
    let height=$('#mapPanel').height()
    //font_scale=Math.min(screen.height,screen.width)/750
    font_scale=Math.min(height,width)*0.0025
    let svg_x=0
    let svg_y=0

    var color=d3.scaleLinear()
        .domain([0, 4])
        .range(["rgba(240,140,131,0.8)","rgba(187,0,0,0.9)" ])
        .interpolate(d3.interpolateHcl);

    var bascolor=["rgb(238,238,238)","rgb(111,213,201)","rgb(255,176,93)","rgb(255,119,105)","rgb(165,200,233)","rgb(244,172,88)"];

    let svg=d3.select("#mapPanel").append("svg")
        .attr("transform", "translate("+svg_x+","+svg_y+")")
        .attr("width", width)
        .attr("height", height)
        .append("g")
    let map_width=d3.min([height*0.85*1.6,width*0.6])
    let map_height=height*0.85
    let map_x=d3.max([width*0.95-map_width,width*0.28])
    let map_y=(height-map_height)/2

    let map_svg=svg 

    var tooltip = d3.select("#tooltip");
 
    let proj_world=d3.geoMercator()
                        .center([0, 23])
                        .scale(d3.min([width/4.1,height/2.3])*0.7)
                        .translate([width/2, height/2]);
    let proj_china=d3.geoMercator()
                        .center([104.4, 36])
                        .scale(width*0.928)
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
    timelineLen=height*0.25;//时间轴长度

    timelineX=proj_world([-170,0])[0]
            //timelineY=height*0.085
    timelineY=height*0.68
    var tScale=d3.scaleLinear()
                .domain([axis_start,axis_end])
                .range([0, timelineLen]);

    let inmap_flag=0
    let hasPath=0
    let inmap=0
    let intext=0
//获取数据

    temp_map="china"
    selected_dataset="support"
    let color_support=[
                    "","rgba(187,0,0,0.9)","rgba(240,140,131,1)","rgba(0, 186, 209, 0.5)","rgba(192, 223, 217,0.5)","rgba(201, 216, 197,0.5)",
                    //5-8
                    "rgba(137, 189, 211,1)","rgba(168,182,198,1)","rgba(137, 189, 211,0.7)","rgb(168,182,198,0.6)",
                    //9-10
                    "rgba(248, 227, 149,1)","rgba(255,211,124,0.8)",
                    //11-13
                    "rgba(219,195,208,0.8)","rgba(125, 188, 169,0.5)","rgba(125, 188, 169,1)",
                    //14-16
                    "rgba(161, 63, 113,0.6)","rgba(224,80,56,0.5)","rgb(212, 126, 152,0.4)"]
                let colorRange=d3.range(7).map(function(i) { return color_support[i] });
                color=d3.scaleThreshold()//阈值比例尺
                        .domain([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16])
                        .range(color_support);
    changeView(temp_map+"_"+"support"+".json","path_china_nCoV.json",temp_map+"_web_info_"+"support"+".json")



    //基础地图数据获取
    function getMapData(fileName,pathDataFile){
        d3.json(fileName).then(cn=>{
            //基础地图数据的赋值
            map_data=cn
            add_islands()
            addMap()
            addOtherInfo()
            getPathData(pathDataFile)
            hasPath=1

            })
    }

    //地图相关数据的获取
    function getStatisticData(fileName){

    }

    //连线数据的获取
    function getPathData(fileName){
        d3.json(fileName).then(move_path=>{
            //连线数据的赋值
            path_data=move_path
            addPath(true)
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
            let axis_1=d

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
    function add_islands(){
        d3.json("islands(1).json").then(cn=>{
            map_svg.append("g").attr("class","islands").selectAll("path")
                    .data(cn.features)
                    .enter()
                    .append("path")              
                    .attr("d", path)
                    //.attr("class","states")  
                    .attr("fill",function(d,i){
                        return "none"
                        
                    })
                    .style("stroke",function(d){
                        return "rgba(20,20,20,0.3)"
                    })
                    .style("stroke-width",function(d){
                        if(d.properties.chinese_name=="湖北") return 5*font_scale
                    })
            map_svg.append("image")
                .attr("xlink:href",function(d,i){
                        return "icon/南海诸岛.svg"
                    })
                    .attr("x",function(d){
                        return width*0.863636
                    })
                    .attr("y",function(d){
                        return width*0.81;
                    })
                    .attr("width",width*0.1303030)
                    .attr("height",width*0.175757)
                    .attr("opacity",function(d){
                        //if(d.icon_loc=="") return 0
                            return 1
                    })
        })
    }
    function addMap(action){
        if(action!="new"){
            map_svg.selectAll(".state").remove()
            //svg.selectAll(".states").remove()
            }

            map_svg.append("g").attr("width",width).attr("height",height).attr("class","state").selectAll("path")
                    .data(map_data.features)
                    .enter()
                    .append("path")              
                    .attr("d", path)
                    //.attr("class","states")  
                    .attr("fill",function(d,i){
                        if(d.properties.stage=='null'){
                            return 
                        }
                        else{
                            //return "blue"
                            return color(d.properties.stage)
                        }
                        
                    })
                    .on("click",function(d){
                            if(d.properties.hasData==1&&d.properties.chinese_name!="湖北") Showmessage(d)
                    })
                    .style("stroke",function(d){
                        if(d.properties.chinese_name=="湖北") return "rgba(20,20,20,0.3)"
                        let t_name= d.properties.chinese_name                            
                            if(t_name.length>=3&&t_name!="内蒙古"&&t_name!="黑龙江")
                                return "rgba(100,100,100,0.6)"
                    })
                    .style("stroke-width",function(d){
                        if(d.properties.chinese_name=="湖北") return 5*font_scale
                    })
            d3.selectAll(".country_text").remove()
            map_svg.selectAll(".country_text")
                .data(map_data.features)
                .enter().append("text")
                .attr("class","country_text")
                .text(function (d) {
                    //console.log(d.id);
                    let t_name= d.properties.chinese_name                            
                    if(t_name.length>=3&&t_name!="内蒙古"&&t_name!="黑龙江") return ""
                    if(d.properties.cp!=0&&d.properties.hasData==1){
                        return d.properties.chinese_name.split(" ")[0];
                    }
                    else return;
                })           
                .attr("fill", "rgba(6,85,178,0.5)")
                .attr("x", function (d) {
                    if(d.properties.cp==0) return ;
                    if(d.id!=""){
                    var local = proj([d.properties.cp[0], d.properties.cp[1]]);
                    //console.log(local[0]);
                    return local[0]-d.properties.chinese_name.split(" ")[0].length*4*font_scale;
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

                .attr("font-size", function(d,i){
                    if(d.properties.main_data==1996) return 8*font_scale
                        else if(d.properties.cp[0]<25.5&&d.properties.cp[0]>18&&d.properties.cp[1]<50&&d.properties.cp[1]>40){
                            return 6*font_scale
                        }
                        else if(selected_dataset=="support") return 9.2*font_scale
                        else return 10.5*font_scale
                })
                .attr("fill-opacity",1)
                .attr("opacity",1)
            //用于高亮显示的名字
            d3.selectAll(".click_text_1").remove()
            map_svg.selectAll(".click_text_1")
                .data(map_data.features)
                .enter().append("text")
                .attr("class","click_text_1")
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
                .attr("font-size", function(d,i){
                    if(d.properties.main_data==1996) return 8*font_scale
                        else return 10*font_scale
                })
                .attr("display","none")
                .attr("fill","#333333")
                .attr("font-family","")
                .attr("font-weight","bold")

            
            //add_nanhai_svg(d3.min([width*0.13,height*0.13]))
    }

    //添加区域的名字
    function addDistrictName(){

            d3.selectAll(".click_text_2").remove()
            map_svg.selectAll(".click_text_2")
                .data(map_data.features)
                .enter().append("text")
                .attr("class","click_text_2")
                .text(function (d) {
                    //console.log(d.id);
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
                    return local[1];
                }
                })
                .attr("dx",function(d,i){
                    return d.properties.dx;

                })
                .attr("dy",function(d,i){
                    
                        return d.properties.dy
                })
                .attr("font-size", function(d,i){
                    if(d.properties.main_data==1996) return 8*font_scale
                        else return 10*font_scale
                })
                .attr("display","none")
                .attr("fill","#333333")
                .attr("font-family","")

            d3.selectAll(".click_text_3").remove()
            map_svg.selectAll(".click_text_3")
                .data(map_data.features)
                .enter().append("text")
                .attr("class","click_text_3")
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
                .attr("font-size", function(d,i){
                    if(d.properties.main_data==1996) return 8*font_scale
                        else return 10*font_scale
                })
                .attr("display","none")
                .attr("fill","#333333")
                .attr("font-family","")
                .attr("font-weight","bold")


            d3.selectAll(".country_num_text").remove()


            map_svg.selectAll(".country_num_text")
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
                    .on("click",function(d){
                        //if(d.properties.chinese_name=="湖北") getMapDataAll()
                           if(d.properties.hasData==1&&d.properties.chinese_name!="湖北") Showmessage(d)
                    })
                .style("text-anchor","middle")
                .attr("dx",function(d,i){
                    return d.properties.dx;

                })
                .attr("dy",function(d,i){
                    
                        return d.properties.dy
                })
                .attr("font-size", function(d,i){
                        return 9.6*font_scale
                })
                .style("font-family","")
                .style("font-weight","bold")
                .attr("fill-opacity",1)
                .attr("opacity",function(){
                    return isregain
                })                         
                //.attr("fill", "rgba(247,254,110,1)")
                .style("fill", "#de5e5b")
    }

    //添加区域的关联数据（颜色、详细信息等）
    function addMapStatistic(){
    }

    //添加连线和circle
    function addPath(hasPath){
        if(hasPath==false){
            d3.selectAll(".support_links").remove()
            d3.selectAll(".mycircle").remove()
            return
        }
        var defs = map_svg.append("defs");
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
                .attr("fill","rgb(160,160,160)")
                .attr("fill-opacity",0.8);
            //迁移过程曲线
            // filters go in defs element
            var defs2 = map_svg.append("defs");

            // create filter with id #drop-shadow
            // height=130% so that the shadow is not clipped
            var filter = defs2.append("filter")
                .attr("id", "drop-shadow")
                .attr("height", "140%");

            // SourceAlpha refers to opacity of graphic that this filter will be applied to
            // convolve that with a Gaussian with standard deviation 3 and store result
            // in blur
            filter.append("feGaussianBlur")
                .attr("in", "SourceAlpha")
                .attr("stdDeviation", 2*font_scale)
                .attr("result", "blur");

            // translate output of Gaussian blur to the right and downwards with 2px
            // store result in offsetBlur
            filter.append("feOffset")
                .attr("in", "blur")
                .attr("dx", 4*font_scale)
                .attr("dy", 4*font_scale)
                .attr("result", "offsetBlur");

            // overlay original SourceGraphic over translated blurred opacity by using
            // feMerge filter. Order of specifying inputs is important!
            var feMerge = filter.append("feMerge");

            feMerge.append("feMergeNode")
                .attr("in", "offsetBlur")
            feMerge.append("feMergeNode")
                .attr("in", "SourceGraphic");

            d3.selectAll(".support_links").remove()
            var country_link=map_svg.selectAll(".support_links")
                    .data(path_data)
                    .enter()
                    .append("path")
                    .attr("class","support_links")
                    .attr("d", function(d){
                        return link(d)
                    })
                 //.attr("marker-end","url(#arrow)")
                 /*.style("fill",function(d,i){
                    if(d.source.name=="Kenya") return "rgb(160,160,160)"
                 })*/
                 .attr("filter", function(d){
                    return "url(#drop-shadow)";
                })
                 .attr("stroke-width",0)
                 .attr("fill-opacity",0.06)
                 .attr("display","none")

            let img_w=width*0.03
            let img_h=img_w/36*50
            map_svg.selectAll(".sourceimg")
                    .data(path_data)
                    .enter()
                    .append("image")
                    .attr("class","sourceimg")
                    .attr("xlink:href",function(d,i){
                        return "icon/love.svg"
                    })
                    .attr("x",function(d){
                        let maploc=proj([d.source.x, d.source.y])
                        return maploc[0]-img_w/2;
                    })
                    .attr("y",function(d){
                        let  maploc=proj([d.source.x, d.source.y])
                        return maploc[1]-img_h/2;
                    })
                    .attr("width",0)
                    .attr("height",0)
                    .attr("opacity",function(d){
                        //if(d.icon_loc=="") return 0
                            return 1
                    })
            map_svg.selectAll(".targetimg")
                    .data(path_data)
                    .enter()
                    .append("image")
                    .attr("class","targetimg")
                    .attr("xlink:href",function(d,i){
                        return "icon/target.svg"
                    })
                    .attr("x",function(d){
                        let maploc=proj([d.target.x, d.target.y])
                        return maploc[0]-img_w/2;
                    })
                    .attr("y",function(d){
                        let  maploc=proj([d.target.x, d.target.y])
                        return maploc[1]-img_h/2;
                    })
                    .attr("width",0)
                    .attr("height",0)
                    .attr("opacity",function(d){
                        //if(d.icon_loc=="") return 0
                            return 1
                    })
    }

    //添加标题、数据来源等
    function addOtherInfo(){
            //添加title
            //添加遮罩
            var remark=svg.append("text")
                                .attr("x",width*0.02)
                                .attr("y",width*1.05)
                                .attr("class","remark_text")
                                .attr("font-size","3vw")
                                .style("fill","#b2b2b2")
                                .text("*点击地图上的省份查看与湖北地区“一对一”支援关系")
            svg.append("rect")
                .attr("class","cover_rect")
                    .attr("x",0)
                    .attr("y",0)
                  .attr("width",width)
                  .attr("height",width*0.172727272)
                  .attr("opacity",0)
            svg.append("rect")
                .attr("class","return_rect")
                .attr("width",width*0.2924)
                .attr("height",width*0.1075)
                .attr("x",width*0.03)
                .attr("y",width*1.053030)
                .attr("rx",width*0.01)
                .attr("ry",width*0.01)
                .attr("fill","#e7e9ed")
                .on("click",function(){
                    Regainmessage()
                })
                .style("cursor","pointer")
                .attr("display","none")
            svg.append("text")
                .attr("class","return_text")
                .attr("x",width*0.03+width*0.2924/2)
                .attr("y",width*(1.017+1.053030-0.95))
                .text("返回全国地图")
                .attr("fill","#333333")
                .attr("font-size",24/7.5+"vw")
                .on("click",function(){
                    Regainmessage()
                })
                .attr("text-anchor","middle")
                .attr("font-family","")
                .style("cursor","pointer").attr("display","none")

            d3.selectAll(".title").remove()  
            var title=svg.append("text")
                                .attr("class","title")
                                .attr("x",width*0.0348)
                                .attr("y",width*0.05)
                                .attr("font-size","4.8vw")
                                .text("兄弟省市对口支援图")
            var time=svg.append("text")
                                .attr("class","end_time_text")
                                .attr("x",width*0.0348)
                                .attr("y",width*0.12)
                                .attr("font-size","3.1vw")
                                .style("fill","#888888")
                                //.text("截至 "+(new Date()).toLocaleString()+" 国家卫健委数据统计")
                                .text("(7:00-10:00左右为数据更新高峰，显示可能略有滞后请谅解)")
            var title_rect=svg.append("rect")
                .attr("class","title_rect")
                    .attr("x",0)
                    .attr("y",width*0.003)
                  .attr("width",width*0.01212)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
                  .attr("height",width*0.0515)
                  .attr("rx",width*0.005)
                  .attr("ry",width*0.005)
                  .attr("fill","#00bad1")
            /*svg.append("image")
                    .attr("xlink:href",function(d,i){
                        return "icon/dataEcplain.svg"
                    })
                    .attr("x",function(d){
                        return width*540/660
                    })
                    .attr("y",function(d){
                        return width*0.076;
                    })
                    .attr("width",width*0.04090)
                    .attr("height",width*0.04090)
                    .attr("opacity",function(d){
                        //if(d.icon_loc=="") return 0
                            return 1
                    })
                    .attr("cursor","pointer")
                    .on("click",function(){
                        d3.select("#dataExplain").style("display","")
                    })*/
        
    }
//结束绘制，开始各种函数了
    function hideDataExplain(){
        d3.select("#dataExplain").style("display","none")
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

    function change_to_timerange(year_0,year_1){
        //console.log(year_0,year_1)
        isregain=1
        d3.selectAll(".remark_text").attr("display","")
        d3.selectAll(".sourceimg").attr("width",0)
        d3.selectAll(".targetimg").attr("width",0)

        d3.selectAll(".return_text").attr("display","none")
        d3.selectAll(".return_rect").attr("display","none")
        d3.selectAll(".cover_rect").attr("opacity",0)

        proj=proj_china
        path=d3.geoPath().projection(proj);
        d3.selectAll(".state")
            .selectAll("path")
            .attr("d",path)
        d3.selectAll(".islands")
            .selectAll("path")
            .attr("d",path)

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
                else if(d.properties.hasData==1) return d.properties.main_data
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
            .attr("opacity",1)
            .attr("display","")
    
        d3.select(".state")
            .selectAll("path")
            .attr("fill",function(d,i){
                    //console.log(d)
                    if(selected_dataset=="support"){
                        if(d.properties.chinese_name=="中国") return "rgba(210,210,210,1)"
                        if(d.properties.hasData==1) return color(d.properties.stage)
                            else return "rgb(255,255,255)"
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
                    else return "rgb(255,255,255)"
                });
        d3.selectAll(".country_text")
                .text(function (d) {
                    //console.log(d.id);
                    let t_name= d.properties.chinese_name                            
                    if(t_name.length>=3&&t_name!="内蒙古"&&t_name!="黑龙江") return ""
                    if(d.properties.cp!=0&&d.properties.hasData==1){
                        if(temp_lan=="chinese") return d.properties.chinese_name.split(" ")[0];
                        else return d.properties.name.split(" ")[0]
                    }
                    else return;
                }) 
                .style("fill-opacity",function(d){
                    if(selected_dataset=="support"&&d.properties.hasData==1) return .9
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
                .attr("x", function (d) {
                    if(d.properties.cp==0) return ;
                    if(d.id!=""){
                    var local = proj([d.properties.cp[0], d.properties.cp[1]]);
                    //console.log(local[0]);
                    return local[0]-d.properties.chinese_name.split(" ")[0].length*4*font_scale;
                }
                })
                .attr("y", function (d) {
                    if(d.properties.cp==0) return ;
                    if(d.id!=""){
                    var local = proj([d.properties.cp[0], d.properties.cp[1]]);
                    return local[1]+5*font_scale;
                }
                })
                .attr("display","")
        d3.selectAll(".country_text2")
                .style("fill-opacity",function(d){
                    if(selected_dataset=="support"&&d.properties.hasData==1) return .9
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
                .attr("display","")
        if(hasPath==0) return true

        d3.selectAll(".support_links")
                .attr("stroke-width",function(d){
                    return 0
                })
                .attr("display","none")

             d3.selectAll(".click_text_1")
                .text("")
             d3.selectAll(".click_text_2")
                .text("")
             d3.selectAll(".click_text_3")
                .text("")
    }

    //选择国家显示详细信息
    function Showmessage(temp_country){
        
        //console.log("show_message")
        isregain=0
        d3.selectAll(".remark_text").attr("display","none")
        d3.selectAll(".return_text").attr("display","")
        d3.selectAll(".return_rect").attr("display","")
        d3.selectAll(".cover_rect").attr("opacity",0.8)
        let other_cp=temp_country.properties.cp
        for(var i=0;i<map_data.features.length;i++){
            if(hasRelation(temp_country,map_data.features[i])==1){
                other_cp=map_data.features[i].properties.cp
                break
            }
        }
        let other_x=other_cp[0]
        let other_y=other_cp[1]
        let zoom_scale=1.8
        if(temp_country.properties.chinese_name=="孝感市"||temp_country.properties.chinese_name=="黑龙江"){
            zoom_scale=1.6
        }
        if(temp_country.properties.chinese_name=="荆门市"){
            other_x+=5
        }
        proj=d3.geoMercator()
                        .center([(temp_country.properties.cp[0]+other_x)/2,
                            (temp_country.properties.cp[1]+other_y)/2])
                        .scale(d3.min([width*1.5,height])*zoom_scale)
                        .translate([width/2, height/2]);
        path=d3.geoPath().projection(proj);
        d3.selectAll(".state")
            .selectAll("path")
            .attr("d",path)
        d3.selectAll(".islands")
            .selectAll("path")
            .attr("d",path)

        dx_remark=0
        dy_remark=height*0.07
        let detail_text=""
                    if(is_data2axis==1){
                        if(temp_lan=="chinese"){
                            for(var k=0;k<data_keys.length;k++){
                                detail_text+=(data_key_chinese[k]+":"+temp_country.properties.main_data+" ")
                            }
                        }
                        else{
                            for(var k=0;k<data_keys.length;k++){
                                detail_text+=(data_key_eng[k]+":"+temp_country.properties.main_data+" ")
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

                if(use_dragBlock==1 && temp_country.properties.main_data[temp_time.toString()]==0) return "rgb(255,255,255)"

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
                    return "rgb(255,255,255)"
                }
                
            });


        d3.selectAll(".country_text")
            .attr("display","none")
        d3.selectAll(".country_text2")
            .attr("display","none")

        d3.selectAll(".click_text_3")
            .attr("font-size",function(d,i){
                if(d.properties.name==temp_country.properties.name){
                    return 14*font_scale
                }
                else if(hasRelation(d,temp_country)==1){
                    return 12*font_scale
                }
                else return 0;
            }).attr("x", function (d) {
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
            .attr("dx",function(d){
                let local=proj(d.properties.cp)
                if(d.properties.chinese_name=="仙桃市") return d.properties.dx+width*0.1
                if(d.properties.name==temp_country.properties.name){
                    if(local[0]+(d.properties.chinese_name.length+detail_text.length)*font_scale*15+dx_remark>width){
                        return width-local[0]-(d.properties.chinese_name.length+detail_text.length)*font_scale*15
                    }
                    return d.properties.dx+dx_remark;
                }
                else return d.properties.dx
            })
            .attr("dy",function(d){
                let temp_dy=15*font_scale
                if(d.properties.chinese_name=="天门市") temp_dy-=8*font_scale
                if(d.properties.chinese_name=="潜江市") temp_dy+=14*font_scale
                if(d.properties.name==temp_country.properties.name){
                    if(d.properties.chinese_name=="中国") return d.properties.dy-dy_remark+temp_dy
                    //if(temp_country.properties.name=="Tanzania"||temp_country.properties.name=="Cuba"||temp_country.properties.name=="Portugal"||temp_country.properties.name=="Ivory Coast") return d.properties.dy
                    return d.properties.dy+dy_remark*2/3+temp_dy;
                }
                else return d.properties.dy+dy_remark*2/3+temp_dy
            })
            .text(function(d,i){
                if(use_dragBlock==1 && temp_country.properties.main_data[temp_time.toString()]==0) return ""
                if(temp_lan=="chinese"){
                    if(d.properties.hasData==1&&d==temp_country) return "确诊 "
                    if(hasPath==1&&hasRelation(d,temp_country)==1){
                        return "确诊 "
                }
                }
                if(d.properties.hasData==1&&d==temp_country) return "cases:"
                if(hasPath==1&&hasRelation(d,temp_country)==1){
                    return "cases:"
                }
            })
            .attr("display",function(d){
                if(hasPath==1&&hasRelation(d,temp_country)==1) return ""
                    if(d.properties.hasData==1&&d==temp_country) return ""
                        else return "none"
            })
            .attr("font-size",function(d){
                if(d.properties.hasData==1&&d==temp_country) return 14*font_scale
                if(hasPath==1&&hasRelation(d,temp_country)==1){
                   return 12*font_scale
                }
            })
            .attr("fill","#888888")
            .attr("font-weight","")
            ;
        d3.selectAll(".click_text_2")
            .attr("font-size",function(d,i){
                if(d.properties.name==temp_country.properties.name){
                    return 14*font_scale
                }
                else if(hasRelation(d,temp_country)==1){
                    return 12*font_scale
                }
                else return 0;
            })
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
            .attr("dx",function(d){
                let local=proj(d.properties.cp)
                if(d.properties.chinese_name=="仙桃市") return d.properties.dx+width*0.1+width*0.07
                if(d.properties.name==temp_country.properties.name){
                    if(local[0]+(d.properties.chinese_name.length+detail_text.length)*font_scale*15+dx_remark>width){
                        return width-local[0]-(d.properties.chinese_name.length+detail_text.length)*font_scale*15+width*0.08
                    }
                    return d.properties.dx+width*0.08;
                }
                else return d.properties.dx+width*0.07
            })
            .attr("dy",function(d){
                let temp_dy=15*font_scale
                if(d.properties.chinese_name=="天门市") temp_dy-=8*font_scale
                if(d.properties.chinese_name=="潜江市") temp_dy+=14*font_scale
                if(d.properties.name==temp_country.properties.name){
                    if(d.properties.chinese_name=="中国") return d.properties.dy-dy_remark+temp_dy
                    //if(temp_country.properties.name=="Tanzania"||temp_country.properties.name=="Cuba"||temp_country.properties.name=="Portugal"||temp_country.properties.name=="Ivory Coast") return d.properties.dy
                    return d.properties.dy+dy_remark*2/3+temp_dy;
                }
                else return d.properties.dy+dy_remark*2/3+temp_dy
            })
            .text(function(d,i){
                if(use_dragBlock==1 && temp_country.properties.main_data[temp_time.toString()]==0) return ""
                if(temp_lan=="chinese"){
                    if(d.properties.hasData==1&&d==temp_country) return " "+d.properties.main_data
                    if(hasPath==1&&hasRelation(d,temp_country)==1){
                        return " "+d.properties.main_data
                }
                }
                if(d.properties.hasData==1&&d==temp_country) return ""+d.properties.main_data
                if(hasPath==1&&hasRelation(d,temp_country)==1){
                    return ""+d.properties.main_data
                }
            })
            .attr("display",function(d){
                if(hasPath==1&&hasRelation(d,temp_country)==1) return ""
                    if(d.properties.hasData==1&&d==temp_country) return ""
                        else return "none"
            })
            .attr("font-size",function(d){
                if(d.properties.hasData==1&&d==temp_country) return 14*font_scale
                if(hasPath==1&&hasRelation(d,temp_country)==1){
                   return 12*font_scale
                }
            })
            .attr("fill","#de5e5b")
            ;
        d3.selectAll(".click_text_1")
            .attr("font-size",function(d,i){
                if(d.properties.name==temp_country.properties.name){
                    return width/80
                }
                else if(hasRelation(d,temp_country)==1){
                    return 12*font_scale
                }
                else return 0;
            }).attr("x", function (d) {
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
            .attr("dx",function(d){
                let local=proj(d.properties.cp)
                if(d.properties.chinese_name=="仙桃市") return d.properties.dx+width*0.11
                if(d.properties.name==temp_country.properties.name){
                    if(local[0]+(d.properties.chinese_name.length+detail_text.length)*font_scale*15+dx_remark>width){
                        return width-local[0]-(d.properties.chinese_name.length+detail_text.length)*font_scale*15
                    }
                    return d.properties.dx+dx_remark;
                }
                else return d.properties.dx
            })
            .attr("dy",function(d){
                let temp_dy=0
                if(d.properties.chinese_name=="天门市") temp_dy=-8*font_scale
                if(d.properties.chinese_name=="潜江市") temp_dy=14*font_scale
                if(d.properties.name==temp_country.properties.name){
                    if(d.properties.chinese_name=="中国") return d.properties.dy-dy_remark+temp_dy
                    //if(temp_country.properties.name=="Tanzania"||temp_country.properties.name=="Cuba"||temp_country.properties.name=="Portugal"||temp_country.properties.name=="Ivory Coast") return d.properties.dy
                    return d.properties.dy+dy_remark*2/3+temp_dy;
                }
                else return d.properties.dy+temp_dy+dy_remark*2/3
            })
            .text(function(d,i){
                if(use_dragBlock==1 && temp_country.properties.main_data[temp_time.toString()]==0) return ""
                if(temp_lan=="chinese"){
                    if(d.properties.hasData==1&&d==temp_country) return d.properties.chinese_name.split(" ")[0]
                    if(hasPath==1&&hasRelation(d,temp_country)==1){
                        return d.properties.chinese_name.split(" ")[0]
                }
                }
                if(d.properties.hasData==1&&d==temp_country) return d.properties.name.split(" ")[0]
                if(hasPath==1&&hasRelation(d,temp_country)==1){
                    return d.properties.name.split(" ")[0]
                }
            })
            .attr("display",function(d){
                if(hasPath==1&&hasRelation(d,temp_country)==1) return ""
                    if(d.properties.hasData==1&&d==temp_country) return ""
                        else return "none"
            })
            .attr("font-size",function(d){
                if(d.properties.hasData==1&&d==temp_country) return 16*font_scale
                if(hasPath==1&&hasRelation(d,temp_country)==1){
                   return 14*font_scale
                }
            });
        d3.selectAll(".country_num_text")
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
            .attr("display","none")


        //改变连线的显示
        d3.selectAll(".support_links")
            .attr("d", function(d){
                        return link(d)
                    })
            .attr("display",function(d,i){
                if(d.source.name==temp_country.properties.name||d.target.name==temp_country.properties.name){
                    return "";
                }
                else{
                    return "none"
                }
            })
            //改变图片的透明度
            let img_w=d3.min([width*0.054,height*0.054])
            let img_h=img_w/36*50
            d3.selectAll(".sourceimg")
                    
                    .attr("x",function(d){
                        let maploc=proj([d.source.x, d.source.y])
                        return maploc[0]-img_w/2;
                    })
                    .attr("y",function(d){
                        let  maploc=proj([d.source.x, d.source.y])
                        return maploc[1]-img_h/2;
                    })
                    .attr("width",function(d){
                        if(d.source.name==temp_country.properties.name||d.target.name==temp_country.properties.name) 
                            return img_w
                        else return 0
                    })
                    .attr("height",img_h)
                    .attr("opacity",function(d){
                        //if(d.icon_loc=="") return 0
                            return 1
                    })
            d3.selectAll(".targetimg")
                    
                    .attr("x",function(d){
                        let maploc=proj([d.target.x, d.target.y])
                        return maploc[0]-img_w/2;
                    })
                    .attr("y",function(d){
                        let  maploc=proj([d.target.x, d.target.y])
                        return maploc[1]-img_h/2;
                    })
                    .attr("width",function(d){
                        if(d.source.name==temp_country.properties.name||d.target.name==temp_country.properties.name) 
                            return img_w
                        else return 0
                    })
                    .attr("height",img_h)
                    .attr("opacity",function(d){
                        //if(d.icon_loc=="") return 0
                            return 1
                    })

    }

    //移开后恢复
    function Regainmessage(){
        change_to_timerange(axis_start,temp_time)
        return true


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
      + "S" + (9/10*local1[0] + local2[0]/10) + "," + (local1[1]-Math.abs( local1[1]=local2[1] )*0.4)
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
        let timeout=3500
        if(temp_map=="china"){
            proj=proj_china
            path = d3.geoPath().projection(proj);
        }
        else{
            proj=proj_world
            path = d3.geoPath().projection(proj);
        }
            getMapData(mapDataFile,pathDataFile)
                
            //getMapNum()
            getApiData()


    }
    function getApiData(){
            let apiInfo = {
                'country': {
                    'dev': 'https://ehcard-test.wecity.qq.com/api',
                    'prod': 'https://wechat.wecity.qq.com/api',
                    'requestBody': {
                        "service": "THOuterDataServer",
                        "func": "getChinaTotal",
                        "args": {
                            "req": {
                                "none": "none"
                            }
                        }
                    }
                },
                'province': {
                    'dev': 'https://ehcard-test.wecity.qq.com/api',
                    'prod': 'https://wechat.wecity.qq.com/api',
                    'requestBody': {
                        "args":{
                            "req":{
                                "none":""
                            }
                        },
                        "service":"THOuterDataServer",
                        "func":"getAreaInfo",
                        "context":{
                        }
                    }
                },
                'city': {
                  'dev': 'https://ehcard-test.wecity.qq.com/api',
                  'prod': 'https://wechat.wecity.qq.com/api',
                  'requestBody': {
                    "args":{
                        "req":{
                            "area":"湖北"
                        }
                    },
                    "service":"THOuterDataServer",
                    "func":"getCityInfo"
                  }
                }
            }
              var areas = ['上海', '云南', '内蒙古', '北京', '台湾', '吉林', '四川', '天津', '宁夏', '安徽', '山东', '山西', '广东', '广西', '新疆', '江苏', '江西', '河北', '河南', '浙江', '海南', '湖北', '湖南', '澳门', '甘肃', '福建', '西藏', '贵州', '辽宁', '重庆', '陕西', '青海', '香港', '黑龙江']
              let isDev = false
              let dataKey = 'prod'
              if (isDev) {
                dataKey = 'dev'
              }
              function requestDataCountry(api){
                let requestBody = api['requestBody']
                let requestInit  = {
                    method: "POST",
                    headers: [
                        ["Content-Type", "application/json"]
                    ],
                    // credentials: "include",
                    body:  JSON.stringify(api['requestBody'])
                }
                // console.log('api data for ', provinceName)
                return d3.json(api[dataKey], requestInit)
              }
              function requestData(api, provinceName='湖北'){
                let requestBody = api['requestBody']
                requestBody['args']['req']['area'] = provinceName
                let requestInit  = {
                    method: "POST",
                    headers: [
                        ["Content-Type", "application/json"]
                    ],
                    // credentials: "include",
                    body:  JSON.stringify(api['requestBody'])
                }
                // console.log('api data for ', provinceName)
                return d3.json(api[dataKey], requestInit)
              }

              requestDataCountry(apiInfo['province']).then(file=>{
                 //console.log('======= country', file)
             
                Promise.all(areas.map(d=>requestData(apiInfo['city'], d))).then(files=>{
                   //console.log('api data all========', files) 
                   let province_num={}
                    for(var i=0;i<files.length;i++){
                        let temp_name=files[i].args.rsp.areaInfo.area
                        let temp_confirm=files[i].args.rsp.areaInfo.confirm
                        province_num[temp_name]=temp_confirm
                        if(temp_name=="湖北"){
                            for(var j=0;j<files[i].args.rsp.city.length;j++){
                                let temp_county=files[i].args.rsp.city[j].mapCity
                                province_num[temp_county]=files[i].args.rsp.city[j].confirm
                            }
                        }
                    }
                    for(var i=0;i<map_data.features.length;i++){
                        map_data.features[i].properties.main_data=province_num[map_data.features[i].properties.chinese_name]
                    }
                    d3.json("china_web_info_support.json", function (error, components) {
                        getComponentData(components)
                    })
                    //console.log(path_data)
                    setTimeout(function(){ 
                        addMapStatistic()
                        //更改标题的数据截至时间
                        /*svg.select(".end_time_text")
                            .text("截至 2020年"+chinaData[chinaData.length-1]["公开时间"]+"24:00 国家卫健委数据统计")*/
                        addDistrictName()
                    }, 100);  
            })
                
        })
    }

    //改变网页的中英文显示
    function changeLanChinese(){
        
            temp_lan="chinese"
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
            d3.selectAll(".click_text_1")
                .text(function(d){
                    return ""
                })
            d3.selectAll(".click_text_2")
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
    }
    function changeLanEnglish(){

            temp_lan="english"
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

