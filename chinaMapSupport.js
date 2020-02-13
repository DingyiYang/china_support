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
    let temp_lan="english"
    let temp_map="world"

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
                        .center([113, 35])
                        .scale(d3.min([width*1.6,height]))
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

//添加南海
function add_nanhai_svg(nanhai_width){
  nanhai_height = nanhai_width * 1.2
  let nanhai_svg = map_svg.append("g")
                .attr('transform', 'translate(' + proj_china([125.5,28])[0] + ',' + proj_china([110,24])[1] + ')')
  let min_edge = nanhai_width 
  center_location = [124.4, 13.2]
  nanhai_svg.append("rect")
    .attr("id", "nanhai_kuang")
    .attr("width", nanhai_width)
    .attr("height", nanhai_height)
    .style("fill","rgb(255,255,255)")
    .style("stroke","#ddd")

  nanhai_svg.append("clipPath")    // define a clip path
    .attr("id", "nanhai-clip") // give the clipPath an ID
    .append("rect")          
    .attr("width", nanhai_width)     
    .attr("height", nanhai_height)   
  nanhai_range = 3
  let projection = d3.geoAlbers()
    .rotate([-center_location[0], 0])
    .center([-0, center_location[1]])
    .scale(min_edge * nanhai_range )
    .translate([nanhai_width , nanhai_height / 2])

  let path = d3.geoPath()
            .projection(projection)

  nanhai_svg.append("text")
    .attr("x", nanhai_width * 0.98)
    .attr("y", nanhai_height * 0.95)
    .attr("text-anchor", "end")
    .text('中国南海')
    .attr("font-size", nanhai_width*0.15)
    .attr("font-family","PingFang-SC")
    .attr("fill","rgb(50,50,50)")

  d3.json("nanhai.json",function (error, nanhai_map){
      console.log(nanhai_map)
      nanhai_svg.selectAll("path")
        .data(nanhai_map.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "small_province")
        .attr("stroke-width", "1px")
        .attr("stroke", "rgb(200,200,200)")
        .attr("fill", "#F2F2F2")
        /*.attr("province_index", function(d){
          return 0
        })*/
        .attr('id', function(d, i){
          return d.properties.name
        })
        .attr("clip-path", "url(#nanhai-clip)") 

      nanhai_svg.select("#九段线")
        .style('stroke-width', nanhai_width/40)
        .style("stroke", "#ddd")
        .attr("class", "nine_line")

    })
}
//获取数据

    temp_map="china"
    selected_dataset="support"
    changeView(temp_map+"_"+"support"+".json","path_china_nCoV.json",temp_map+"_web_info_"+"support"+".json")



    //基础地图数据获取
    function getMapData(fileName){
        d3.json(fileName, function (error, cn) {
            //基础地图数据的赋值
            map_data=cn

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
            if(selected_dataset=="support"){
                //let color_support=["","rgb(255, 205, 210)","rgb(239, 154, 154)","rgb(229, 115, 115)","rgb(255, 224, 178)","rgb(255, 183, 77)","rgb(251, 140, 0)","rgb(239, 108, 0)"]
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
            map_svg.selectAll(".state").remove()
            //svg.selectAll(".states").remove()
            }

            map_svg.append("g").attr("class","state").selectAll("path")
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
                        //if(d.properties.chinese_name=="湖北") getMapDataAll()
                            if(d.properties.hasData==1&&d.properties.chinese_name!="湖北") Showmessage(d)
                    })
                    .on("mouseout",function(d){
                        if(isregain==0) Regainmessage()
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

            svg.append("rect")
                .attr("class","return_rect")
                .attr("width",width*0.2924)
                .attr("height",width*0.1075)
                .attr("x",width*0.03)
                .attr("y",width*0.95)
                .attr("rx",width*0.01)
                .attr("ry",width*0.01)
                .attr("fill","#e7e9ed")
                .on("click",function(){
                    Regainmessage()
                })
                .style("cursor","pointer")
                .attr("opacity",0)
            svg.append("text")
                .attr("class","return_text")
                .attr("x",width*0.03+width*0.2924/2)
                .attr("y",width*1.017)
                .text("返回全国地图")
                .attr("fill","#333333")
                .attr("font-size",24/7.5+"vw")
                .on("click",function(){
                    Regainmessage()
                })
                .attr("text-anchor","middle")
                .attr("font-family","PingFang-SC")
                .style("cursor","pointer")
                .attr("opacity",0)
            add_nanhai_svg(d3.min([width*0.13,height*0.13]))
    }

    //添加区域的名字
    function addDistrictName(){
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
                .on("click",function(){
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
                .attr("fill","#333333")
                .attr("font-family","PingFang-SC")
                .attr("font-weight","bold")

            d3.selectAll(".click_text_2").remove()
            map_svg.selectAll(".click_text_2")
                .data(map_data.features)
                .enter().append("text")
                .attr("class","click_text_2")
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
                .on("click",function(){
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
                .style("fill-opacity",0)
                .attr("fill","#333333")
                .attr("font-family","PingFang-SC")


            //添加国家名字
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


            d3.selectAll(".country_text2").remove()
            map_svg.selectAll(".country_text2")
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
                .attr("font-size", function(d,i){
                    if(d.properties.main_data==1996) return 8*font_scale
                        else if(d.properties.cp[0]<25.5&&d.properties.cp[0]>18&&d.properties.cp[1]<50&&d.properties.cp[1]>40){
                            return 6*font_scale
                        }
                        else if(selected_dataset=="support") return 9.2*font_scale                       
                        else return 11*font_scale
                })
                .attr("fill-opacity",1)
                .attr("opacity",1)

            d3.selectAll(".country_num_text").remove()

            if(show_detail==0){
                return true
            }


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
                        if(d.source.name=="Russia"||d.target.name=="Tanzania") return link_2(d)
                        if(d.source.name=="Angola") return link_3(d)
                        return link(d)
                    })
                 //.attr("marker-end","url(#arrow)")
                 /*.style("fill",function(d,i){
                    if(d.source.name=="Kenya") return "rgb(160,160,160)"
                 })*/
                 .attr("filter", function(d){
                    return "url(#drop-shadow)";
                })
                 .on("click",function(){
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

            d3.selectAll(".title").remove()  
            var title=svg.append("text")
                                .attr("class","title")
                                .attr("x",width*0.0348)
                                .attr("y",width*0.05)
                                .attr("font-size",40/7.5+"vw")
                                .text("兄弟省市对口支援图")
            var time=svg.append("text")
                                .attr("x",width*0.0348)
                                .attr("y",height*0.08)
                                .attr("font-size","2.5vmin")
                                .style("fill","#b2b2b2")
                                .text("截至 "+(new Date()).toLocaleString()+" 国家卫健委数据统计")

            var remark=svg.append("text")
                                .attr("x",width*0.02)
                                .attr("y",width*1.1)
                                .attr("font-size","3vmin")
                                .style("fill","#b2b2b2")
                                .text("*点击地图上的省份查看与湖北地区“一对一”支援关系")
            var title_rect=svg.append("rect")
                .attr("class","title_rect")
                    .attr("x",0)
                    .attr("y",width*0.003)
                  .attr("width",width*0.01212)
                  .attr("height",width*0.0515)
                  .attr("rx","0.61vw")
                  .attr("ry","0.61vw")
                  .attr("fill","#00bad1")
        
    }
//结束绘制，开始各种函数了

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
                        return "rgb(255,255,255)"
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
            d3.selectAll(".support_links")
                .style("stroke-width",function(d){
                        return 
                })
                .style("fill",function(d){
                if(d.source.name=="Portugal"){
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
        d3.selectAll(".sourceimg").attr("width",0)
        d3.selectAll(".targetimg").attr("width",0)

        d3.selectAll(".return_text").attr("opacity",0)
        d3.selectAll(".return_rect").attr("opacity",0)

        proj=proj_china
        path=d3.geoPath().projection(proj);
        d3.selectAll(".state")
            .selectAll("path")
            .attr("d",path)

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

        d3.selectAll(".support_links")
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

                    }
                    let temp_data=d.main_data
                    //if(is_date==1) temp_data=countGapDays(start_date,temp_data)
                    if(temp_data<year_1&&temp_data>year_0) return 0.4
                        else return 0
                })
             d3.selectAll(".click_text_1")
                .text("")
             d3.selectAll(".click_text_2")
                .text("")
    }

    //选择国家显示详细信息
    function Showmessage(temp_country){
        
        //console.log("show_message")
        d3.selectAll(".return_text").attr("opacity",1)
        d3.selectAll(".return_rect").attr("opacity",1)
        let other_cp=temp_country.properties.cp
        for(var i=0;i<map_data.features.length;i++){
            if(hasRelation(temp_country,map_data.features[i])==1){
                other_cp=map_data.features[i].properties.cp
                break
            }
        }
        proj=d3.geoMercator()
                        .center([(temp_country.properties.cp[0]+other_cp[0])/2,
                            (temp_country.properties.cp[1]+other_cp[1])/2])
                        .scale(d3.min([width*1.5,height])*1.7)
                        .translate([width/2, height/2]);
        path=d3.geoPath().projection(proj);
        d3.selectAll(".state")
            .selectAll("path")
            .attr("d",path)

        dx_remark=width/60
        dy_remark=height/20
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
            .style("fill-opacity",0)
        d3.selectAll(".country_text2")
            .style("fill-opacity",0)

        d3.selectAll(".click_text_2")
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
                if(d.properties.chinese_name=="潜江市") temp_dy=12*font_scale
                if(d.properties.name==temp_country.properties.name){
                    if(d.properties.chinese_name=="中国") return d.properties.dy-dy_remark+temp_dy
                    //if(temp_country.properties.name=="Tanzania"||temp_country.properties.name=="Cuba"||temp_country.properties.name=="Portugal"||temp_country.properties.name=="Ivory Coast") return d.properties.dy
                    return d.properties.dy+dy_remark*2/3+temp_dy;
                }
                else return d.properties.dy+temp_dy+20*font_scale
            })
            .text(function(d,i){
                if(use_dragBlock==1 && temp_country.properties.main_data[temp_time.toString()]==0) return ""
                if(temp_lan=="chinese"){
                    if(d.properties.hasData==1&&d==temp_country) return d.properties.chinese_name.split(" ")[0]+" "+detail_text
                    if(hasPath==1&&hasRelation(d,temp_country)==1){
                        return d.properties.chinese_name.split(" ")[0]+" 确诊:"+d.properties.main_data
                }
                }
                if(d.properties.hasData==1&&d==temp_country) return d.properties.name.split(" ")[0]+" "+detail_text
                if(hasPath==1&&hasRelation(d,temp_country)==1){
                    return d.properties.name.split(" ")[0]+" cases:"+d.properties.main_data
                }
            })
            .style("fill-opacity",1)
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
            .attr("opacity",0)


        //改变连线的显示
        d3.selectAll(".support_links")
            .attr("d", function(d){
                        if(d.source.name=="Russia"||d.target.name=="Tanzania") return link_2(d)
                        if(d.source.name=="Angola") return link_3(d)
                        return link(d)
                    })
            .style("stroke-width",function(d,i){
                //console.log(d)
                if(d.source.name==temp_country.properties.name||d.target.name==temp_country.properties.name){
                    return 2*font_scale;
                }
                else{
                    return 0
                }
            })
            .style("fill",function(d){
                if(d.source.name=="Portugal"){
                    if(d.source.name==temp_country.properties.name||d.target.name==temp_country.properties.name){
                    return "black"
                }
                }

             }).style("opacity",function(d){
                if(use_dragBlock==1 && d.date>temp_time) return 0
                return 1
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
        d3.selectAll(".viewrect")
            .style("fill-opacity",0)
        d3.selectAll(".click_text_1")
            .style("fill-opacity",0)
        d3.selectAll(".click_text_2")
            .style("fill-opacity",0)
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
            getMapData(mapDataFile)
            if(pathDataFile!=""){
                getPathData(pathDataFile)
                hasPath=1
            }
            else{
                    hasPath=0
                    path_data={}
                }
                
            getMapNum()


    }

    //获取地图中每个地图的数据
    function getMapNum(){
        let chinaMap
        let chinaData
        d3.json("chinamap/china_countries_bilingual.json",function(temp_map_data){
                //console.log(data)
                chinaMap=temp_map_data
                getHubeiNum(chinaMap)
            })
    }
    function getHubeiNum(chinaMap){
        let chinaData
        d3.json("chinamap/hubei_bilingual.json",function(temp_map_data){
                //console.log(data)
                hubeiMap=temp_map_data
                d3.csv("https://tanshaocong.github.io/2019-nCoV/map.csv",function(data){
                //console.log(data)
                    chinaData=data
                    //求解湖北的数据
                    let province_num=0
                    //中国的数据范围
                    let china_data_range=[1,40,80,160,320,640,30000]
                    let pre_num={}
                    let pre_province_num={}
                    let start_date=date_chinese2eng(chinaData[0]["公开时间"])
                    let end_date=date_chinese2eng(chinaData[chinaData.length-1]["公开时间"])
                    let update_day=parseInt(chinaData[chinaData.length-1]["公开时间"].split("月")[1].split("日")[0])
                    for(var i=0;i<chinaMap.features.length;i++){
                        let t_province=chinaMap.features[i].properties.chinese_name
                        pre_province_num[t_province]=0
                        chinaMap.features[i].properties.main_data={}
                    }
                    for(var i=0;i<hubeiMap.features.length;i++){
                        let t_county=hubeiMap.features[i].properties.chinese_name.substr(0,2)
                        pre_num[t_county]=0
                        hubeiMap.features[i].properties.main_data={}
                    }
                    for(var i=0;i<chinaData.length;i++){
                        //console.log(parseInt(""))
                        let temp_province=chinaData[i]["省份"]
                        let t_county=chinaData[i]["城市"]
                        if(chinaData[i]["类别"]=="地区级"&&temp_province!="湖北"){
                            for(var j=0;j<chinaMap.features.length;j++){
                                if(chinaMap.features[j].properties.chinese_name==temp_province){
                                    //console.log(chinaData[j])
                                    let temp_record=chinaData[i]
                                    let t_time=date_chinese2eng(temp_record["公开时间"])
                                    let t_data=temp_record["新增确诊病例"] 
                                        if(t_data!=""&&t_data!="0") pre_province_num[temp_province]+=parseInt(t_data)
                                    if(chinaData[i]["核减"]!="") pre_province_num[temp_province]+=parseInt(chinaData[i]["核减"]) 
                                    //if(isNaN(pre_province_num[temp_province])==true) console.log(temp_record)
                                        chinaMap["features"][j]["properties"]["main_data"][t_time]=pre_province_num[temp_province]
                                    break
                                }
                            }
                        }
                        if(temp_province!="湖北") continue
                        for(var j=0;j<hubeiMap.features.length;j++){
                            if(hubeiMap.features[j].properties.chinese_name.substr(0,2)==t_county.substr(0,2)){
                                //console.log(chinaData[j])
                                t_county=t_county.substr(0,2)
                                let temp_record=chinaData[i]
                                let t_time=date_chinese2eng(temp_record["公开时间"])
                                let t_data=temp_record["新增确诊病例"]
                                    if(t_data!=""&&t_data!="0") pre_num[t_county]+=parseInt(t_data)
                                if(chinaData[i]["核减"]!="") pre_num[t_county]+=parseInt(chinaData[i]["核减"]) 
                                //if(isNaN(pre_num[t_county])==true) console.log(temp_record)
                                    hubeiMap["features"][j]["properties"]["main_data"][t_time]=pre_num[t_county]
                                break
                            }
                        }
                        //console.log(chinaMap["features"][i].properties)
                    }
                    //中国的
                    for(var i=0;i<chinaMap.features.length;i++){
                        let pre_data=0
                        for(var j=parseInt(start_date);j<=parseInt(end_date);){
                            if(chinaMap.features[i].properties.main_data.hasOwnProperty(j)==false)
                                chinaMap.features[i].properties.main_data[j]=pre_data
                            else
                                pre_data=chinaMap.features[i].properties.main_data[j]
                            j=countDate(j,1).replaceAll("/","")
                        }
                    }
                    for(var i=0;i<chinaMap.features.length;i++){
                        for(var j=0;j<map_data.features.length;j++){
                            if(chinaMap.features[i].properties.chinese_name==map_data.features[j].properties.chinese_name){
                                map_data["features"][j]["properties"]["main_data"]=chinaMap.features[i].properties.main_data[end_date]
                                province_confirm_num[chinaMap.features[i].properties.chinese_name]=chinaMap.features[i].properties.main_data[end_date]
                                break
                            }
                        }
                    }
                    console.log((chinaMap))
                    //湖北的
                    for(var i=0;i<hubeiMap.features.length;i++){
                        let pre_data=0
                        for(var j=parseInt(start_date);j<=parseInt(end_date);){
                            if(hubeiMap.features[i].properties.main_data.hasOwnProperty(j)==false)
                                hubeiMap.features[i].properties.main_data[j]=pre_data
                            else
                                pre_data=hubeiMap.features[i].properties.main_data[j]
                            j=countDate(j,1).replaceAll("/","")
                        }
                    }
                    let county_nums=[]
                    for(var i=0;i<hubeiMap.features.length;i++){
                        for(var j=0;j<map_data.features.length;j++){
                            if(hubeiMap.features[i].properties.chinese_name==map_data.features[j].properties.chinese_name){
                                map_data["features"][j]["properties"]["main_data"]=hubeiMap.features[i].properties.main_data[end_date]
                                county_confirm_num[hubeiMap.features[i].properties.chinese_name]=hubeiMap.features[i].properties.main_data[end_date]
                                county_nums.push(parseInt(hubeiMap.features[i].properties.main_data[end_date]))
                                break
                            }
                        }
                    }
                    county_nums=county_nums.sort(compare)
                    console.log(county_nums)

                    function compare(num1,num2){
                      return num2 - num1;
                    }
                    //console.log(county_confirm_num)
                    let temp_id=0
                    for(var i=0;i<county_nums.length;i++){
                        for(var key in county_confirm_num){
                            if(county_confirm_num[key]==county_nums[i]&&county_order.hasOwnProperty(key)==false){
                                county_order[key]=i
                                county_id[key]=temp_id
                                temp_id+=1
                                if(key=="孝感市"||key=="黄冈市"||key=="荆州市"||key=="襄阳市"||key=="荆门市"){
                                    temp_id+=1
                                }
                            }
                        }
                    }          
                    d3.json("china_web_info_support.json", function (error, components) {
                        components.axis_range[1]=parseInt(end_date)
                        getComponentData(components)
                    })
                    setTimeout(function(){ 
                        addMap()
                        addMapStatistic()
                        addOtherInfo()
                        addPath(true)
                        addDistrictName()
                        changeLanChinese()
                    }, 500);
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

