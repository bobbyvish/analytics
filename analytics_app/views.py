from django.shortcuts import render
from django.http import JsonResponse
from .models import VisitorActivity , get_client_ip
from django.views.decorators.csrf import csrf_exempt
import datetime
from django.db.models.functions import TruncDate, Coalesce
from django.db.models import Sum, Count,F ,Min, Max, Q, Case, When 
from django.db import models
import arpreq

@csrf_exempt
def analytics_data(request):
    print("user agents details full request ======",request.META.get('HTTP_USER_AGENT', ''))
    ip_address = get_client_ip(request)
    duration = request.POST.get('duration')
    url= request.POST.get("url")
    mac_address = request.POST.get('mac_address')
    print(f"ip address is {ip_address} mac_address is {mac_address} duration is {duration} and path is {url}")

    try:
        user_activity_obj = VisitorActivity.objects.filter(ip_address=ip_address, mac_address=mac_address, timestamp__date = datetime.datetime.today())
        user_activity_obj_first = user_activity_obj.first()
        user_activity_obj_last = user_activity_obj.last()
        user_activity_obj_count = user_activity_obj.count()

        if user_activity_obj_count == 0:
            print("equals to 0")
            user_activity = VisitorActivity(
                ip_address=ip_address,
                url=url,
                duration=duration,
                page_type=VisitorActivity.HIT,
                mac_address = mac_address
            )
            user_activity.save(request=request)

        else:
            if user_activity_obj_last.url == url:
                # Update duration if the URL is the same
                user_activity_obj_last.duration += int(duration)
                user_activity_obj_last.save(request = request)
            else:
                if user_activity_obj_count == 1:
                    print("equals to 1")
                    user_activity = VisitorActivity(
                        ip_address=ip_address,
                        url=url,
                        duration=duration,
                        page_type=VisitorActivity.EXIT,
                        mac_address = mac_address
                    )
                    user_activity.save(request=request)

                elif user_activity_obj_count > 1:
                    print("Greater then 1")
                    user_activity_obj_last.page_type = VisitorActivity.SURF
                    user_activity_obj_last.save(request = request)

                    # Add new entry for the different URL
                    user_activity = VisitorActivity(
                        ip_address=ip_address,
                        url=url,
                        duration=duration,
                        page_type=VisitorActivity.EXIT,
                        mac_address = mac_address
                    )
                    user_activity.save(request=request)
       
    except Exception as e:
        print("error is", str(e))
        return JsonResponse({'message': "Error", "status": 400})

    return JsonResponse({'message' : "Success", "status":200})

def dashboard(request):
    page_name = {
        "http://192.168.1.15:8500/analytics/index/" : "Home",
        "http://192.168.1.15:8500/analytics/features/" : "Feature",
        "http://192.168.1.15:8500/analytics/pricing/" : "Pricing",
        "http://192.168.1.15:8500/analytics/about/": "About",
        "http://192.168.1.15:8500/analytics/contact/" : "Contact Us"
    }

    try:
        subquery = VisitorActivity.objects.filter(
                                            ip_address = models.OuterRef("ip_address"),
                                            page_type = VisitorActivity.HIT,
                                        ).values("timestamp")[:1]
        
        user_activity = VisitorActivity.objects.annotate(
                                                    date = TruncDate("timestamp")
                                                ).values(
                                                    "date","ip_address","mac_address"
                                                ).annotate(
                                                    duration_sum = Sum("duration"),
                                                    hit_time = Min(
                                                                Case(
                                                                    When(page_type = VisitorActivity.HIT, then=F("timestamp")),
                                                                    default=None, 
                                                                    output_field=models.DateTimeField()
                                                                )
                                                            ),
                                                    exit_time = Max(
                                                                Case(
                                                                    When(page_type = VisitorActivity.EXIT, then=F("timestamp")),
                                                                    default=None, 
                                                                    output_field=models.DateTimeField()
                                                                )
                                                            ),
                                                    device_type = Case(
                                                                    When(is_mobile=True, then=models.Value("Mobile", output_field = models.CharField())),
                                                                    When(is_pc= True, then=models.Value("Pc", output_field = models.CharField())),
                                                                    When(is_tablet = True, then=models.Value("Tablet", output_field = models.CharField())),
                                                                    default=None, 
                                                                    output_field=models.CharField()
                                                                )
                                                ).values(
                                                    "date",
                                                    "ip_address",
                                                    "mac_address",
                                                    "hit_time",
                                                    "exit_time",
                                                    "duration_sum",
                                                    "browser_family",
                                                    "device_family",
                                                    "os_family",
                                                    "is_bot",
                                                    "device_type",
                                                    "city",
                                                    "country"
                                                )
    except Exception as e:
        print(f"Error in dashboard user_activity {str(e)}")
        user_activity =[]

    print("++++++++++++++++++++++++++++++++",user_activity)

    # try:
    #     page_wise_hit = VisitorActivity.objects.filter(page_type = VisitorActivity.HIT).values("url").annotate(count = Count("id")).order_by("-count")
    # except:
    #     page_wise_hit = []

    # print("page_wise_hit is ",page_wise_hit)

    # try:
    #     page_wise_exit = VisitorActivity.objects.filter(page_type = VisitorActivity.EXIT).values("url").annotate(count = Count("id")).order_by("-count")
    # except:
    #     page_wise_exit = []

    # print("page_wise_exit is ",page_wise_exit)

    try:
        page_wise_hit_exit = VisitorActivity.objects.filter(page_type__in=[VisitorActivity.HIT, VisitorActivity.EXIT]).values("url").annotate(
                                                                    hit= Coalesce(Sum(
                                                                        Case(When(page_type = VisitorActivity.HIT, then = 1), default =0 , output_field = models.IntegerField())
                                                                    ),0),
                                                                    exit= Coalesce(Sum(
                                                                        Case(When(page_type = VisitorActivity.EXIT, then = 1), default =0 , output_field = models.IntegerField())
                                                                    ),0),
                                                                    duration = Sum("duration")
                                                                ).values("url","hit","exit","duration")
        
    except Exception as e:
        print("error in page wise hit and exit ",str(e))
        page_wise_hit_exit =[]

    print("page wise hit and exit si ",page_wise_hit_exit)

    page_name_hit_exit = []
    for data in page_wise_hit_exit:
        temp={}
        temp["url"] = data["url"]
        temp["url_page_name"] = page_name[data["url"]] if data["url"] in page_name else data["url"]
        temp["duration"] = data["duration"]
        temp["hit"] = data["hit"]
        temp["exit"] = data["exit"]
        page_name_hit_exit.append(temp)
    
    print(f"page_name_hit_exit is {page_name_hit_exit}")

    # try:
    #     country_wise_hit_exit = VisitorActivity.objects.filter(page_type__in=[VisitorActivity.HIT, VisitorActivity.EXIT]).values("url").annotate(
    #                                                                 hit= Coalesce(Sum(
    #                                                                     Case(When(page_type = VisitorActivity.HIT, then = 1), default =0 , output_field = models.IntegerField())
    #                                                                 ),0),
    #                                                                 exit= Coalesce(Sum(
    #                                                                     Case(When(page_type = VisitorActivity.EXIT, then = 1), default =0 , output_field = models.IntegerField())
    #                                                                 ),0),
    #                                                                 duration = Sum("duration")
    #                                                             )
    # except Exception as e:
    #     print("error in page wise hit and exit ",str(e))
    #     country_wise_hit_exit =[]

    try:
        total = VisitorActivity.objects.values(
                                            "ip_address"
                                        ).annotate(
                                            total_duration=Sum("duration")
                                        ).aggregate(
                                            total_duration_sum=Sum("total_duration"),
                                            total_address=Count("ip_address"))
    except Exception as e:
        print(f"Error in dashboard {str(e)}")
        total =[]
    
    try:
        total_page_type = VisitorActivity.objects.aggregate(
                                                    hit_count= Coalesce(Sum(
                                                        Case(When(page_type= VisitorActivity.HIT, then= 1), default= 0, output_field=models.IntegerField())
                                                    ),0),
                                                    exit_count= Coalesce(Sum(
                                                        Case(When(page_type= VisitorActivity.EXIT, then= 1), default= 0, output_field=models.IntegerField())
                                                    ),0)
                                                )
    except Exception as e:
        print(f"error in hit and exit == {str(e)}")
        total_page_type =[]
    
    total_hit = total_page_type.get("hit_count")
    total_exit = total_page_type.get("exit_count")
    total_duration_sum = total.get('total_duration_sum')
    total_address = total.get('total_address')

    return render(request, "dashboard.html", locals())

def journey(request):
    try:
        user_activity = VisitorActivity.objects.filter(
                                                    ip_address= request.GET.get("ip_address"),
                                                    mac_address = request.GET.get("mac_address"),
                                                    timestamp__date = request.GET.get("date")
                                                ).annotate(
                                                device_type = Case(
                                                                    When(is_mobile=True, then=models.Value("Mobile", output_field = models.CharField())),
                                                                    When(is_pc= True, then=models.Value("Pc", output_field = models.CharField())),
                                                                    When(is_tablet = True, then=models.Value("Tablet", output_field = models.CharField())),
                                                                    default=None, 
                                                                    output_field=models.CharField()
                                                                )
                                                ).values(
                                                    "ip_address",
                                                    "mac_address",
                                                    "timestamp",
                                                    "duration",
                                                    "url",
                                                    "page_type",
                                                    "browser_family",
                                                    "device_family",
                                                    "os_family",
                                                    "is_bot",
                                                    "device_type",
                                                    "city",
                                                    "country"
                                                )
    except Exception as e:
        print("raise exception in journey",str(e))
        user_activity = []

    return render(request, "journey.html", locals())

def hit_exit_details(request):
    url = request.GET.get("url")
    type = request.GET.get('type')

    print(f"url is {url} and type is {type}")
    try:
        hit_exit_ip_list = VisitorActivity.objects.filter(
                                                    url = url , 
                                                    page_type= type
                                                ).annotate(
                                                    device_type = Case(
                                                            When(is_mobile=True, then=models.Value("Mobile", output_field = models.CharField())),
                                                            When(is_pc= True, then=models.Value("Pc", output_field = models.CharField())),
                                                            When(is_tablet = True, then=models.Value("Tablet", output_field = models.CharField())),
                                                            default=None, 
                                                            output_field=models.CharField()
                                                        )
                                                ).values(
                                                    "ip_address",
                                                    "timestamp", 
                                                    "duration",
                                                    "browser_family",
                                                    "device_family",
                                                    "os_family",
                                                    "is_bot",
                                                    "device_type",
                                                    "city",
                                                    "country"
                                                )
    except Exception as e:
        print("raise exception in detail_hit_exit", str(e))
        hit_exit_ip_list = []
    print(f"hit and exit ip list {hit_exit_ip_list}")
    

    # if type == VisitorActivity.EXIT:
    #     try:
    #         hit_ip_list = VisitorActivity.objects.filter(url = url , page_type= type).values("ip_address","timestamp, duration")
    #     except Exception as e:
    #         print("raise exception in detail_hit_exit", str(e))
        
    return render(request, "hit_exit_details.html", locals())

def page_type_details(request):
    type = request.GET.get('type')
    try:
        hit_exit_ip_list = VisitorActivity.objects.filter(
                                                        page_type= type
                                                ).annotate(
                                                        device_type = Case(
                                                                When(is_mobile=True, then=models.Value("Mobile", output_field = models.CharField())),
                                                                When(is_pc= True, then=models.Value("Pc", output_field = models.CharField())),
                                                                When(is_tablet = True, then=models.Value("Tablet", output_field = models.CharField())),
                                                                default=None, 
                                                                output_field=models.CharField()
                                                        )
                                                ).values(
                                                    "ip_address",
                                                    "timestamp",
                                                    "url",
                                                    "duration",
                                                    "browser_family",
                                                    "device_family",
                                                    "os_family",
                                                    "is_bot",
                                                    "device_type",
                                                    "city",
                                                    "country"
                                                )
    except Exception as e:
        print("raise exception in detail_hit_exit" + str(e))
        hit_exit_ip_list = []
    print(f"hit and exit ip list {hit_exit_ip_list}")
    return render(request, "page_type_details.html", locals())

import uuid

def index(request):
    
    # 'mac_address' now contains the MAC address in the format XX:XX:XX:XX:XX:XX
    # print(f"mac_address is {mac_address}")
    # print(datetime.now())
    
    response = render(request, "index.html")
    mac = request.COOKIES.get("mac_address")
    if not mac:
        expires = datetime.datetime.now() + datetime.timedelta(days=365 * 10)  # Set the expiration to 10 years from now
        mac_address = str(uuid.uuid4())
        print(f"generating mac address {mac_address}")
        response.set_cookie('mac_address', mac_address, expires=expires, path='/')
    print(f"mac adddress through cookie {mac}")
    return response

def contact(request):
    print(f"mac_address from cookies is {request.COOKIES.get('mac_address')}")
    return render(request, "contact_us.html")

def about(request):
    print(f"mac_address from cookies is {request.COOKIES.get('mac_address')}")
    return render(request, "about.html")

def pricing(request):
    print(f"mac_address from cookies is {request.COOKIES.get('mac_address')}")
    return render(request, "price.html")

def features(request):
    print(f"mac_address from cookies is {request.COOKIES.get('mac_address')}")
    return render(request, "features.html")

# def datatable():
#     if request.is_ajax() and request.method == "POST":
# 			datatables = request.POST
# 			# print(datatables)
# 			draw = int(datatables.get('draw'))
# 			start = int(datatables.get('start'))
# 			length = int(datatables.get('length'))
# 			over_all_search = datatables.get('search[value]')

# 			customer_names=datatables.get("columns[1][search][value]", None)
# 			customer_group=datatables.get("columns[2][search][value]", None)
# 			phone_nos=datatables.get("columns[3][search][value]",None)
# 			email=datatables.get("columns[4][search][value]",None)
# 			location=datatables.get("columns[5][search][value]",None)

# 			# print(customer_names,customer_group,phone_nos,email,location)

# 			advance_filter= Q()
# 			if customer_names:
# 				advance_filter &=Q(customer_name__icontains=customer_names)
# 			# if customer_group:
# 			# 	advance_filter &=Q(new_customer_groups__group_name__icontains =customer_group)
# 			if phone_nos:
# 				advance_filter &=Q(phone_no__icontains=phone_nos)
# 			if email:
# 				advance_filter &=Q(email__icontains=email)
# 			if location:
# 				advance_filter &=Q(area_building__icontains=location)
			
# 			if over_all_search:
# 				advance_filter |=Q(customer_name__icontains=over_all_search) | Q(phone_no__icontains=over_all_search) | Q(email__icontains=over_all_search) | Q(area_building__icontains=over_all_search)
		
# 			if over_all_search or customer_names or customer_group or phone_nos or email or location:
# 				customers_obj=customers_obj_with_group.filter(
# 															advance_filter
# 														).values("id","customer_name","phone_no","email","area_building","new_customer_groups__group_name")
# 				customer_count=customers_obj.count()

# 			page_number = start / length + 1

# 			paginator = Paginator(customers_obj, length)

# 			try:
# 				object_list = paginator.page(page_number).object_list
# 			except PageNotAnInteger:
# 				object_list = paginator.page(1).object_list
# 			except EmptyPage:
# 				object_list = paginator.page(paginator.num_pages).object_list
					

# 			data={				
# 				'draw': draw,
# 				'recordsTotal': customer_count,   # draw, recordssTotal, recordsFilter is use for datatables 
# 				'recordsFiltered': customer_count,
# 				"customers_obj" : list(object_list)
# 			}
			
# 			return JsonResponse(data,safe=False)
#     pass