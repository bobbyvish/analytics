from django.shortcuts import render
from django.http import JsonResponse
from .models import VisitorActivity , get_client_ip
from django.views.decorators.csrf import csrf_exempt
import datetime
from django.db.models.functions import TruncDate, Coalesce
from django.db.models import Sum, Count,F ,Min, Max, Q, Case, When , IntegerField

@csrf_exempt
def analytics_data(request):
    ip_address = get_client_ip(request)
    duration = request.POST['duration']
    url= request.POST["url"]
    print(f"duration is {duration} and path is {request.path}")

    try:
        user_activity_obj = VisitorActivity.objects.filter(ip_address=ip_address, timestamp__date = datetime.datetime.today())
        user_activity_obj_first = user_activity_obj.first()
        user_activity_obj_last = user_activity_obj.last()
        user_activity_obj_count = user_activity_obj.count()

        if user_activity_obj_count == 0:
            print("equals to 0")
            user_activity = VisitorActivity(
                ip_address=ip_address,
                url=url,
                duration=duration,
                page_type=VisitorActivity.HIT
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
                        page_type=VisitorActivity.EXIT
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
                        page_type=VisitorActivity.EXIT
                    )
                    user_activity.save(request=request)
       
    except Exception as e:
        print("error is", str(e))
        return JsonResponse({'message': "Error", "status": 400})

    return JsonResponse({'message' : "Success", "status":200})

def dashboard(request):

    page_name = {
        "/analytics/index/" : "Home",
        "/analytics/features/" : "Feature",
        "/analytics/pricing/" : "Pricing",
        "/analytics/about/": "About",
        "/analytics/contact/" : "Contact Us"
    }

    try:
        user_activity = VisitorActivity.objects.annotate(date = TruncDate("timestamp")).values("date","ip_address","browser").annotate(duration_sum = Sum("duration")).values("date","ip_address","duration_sum","browser")
    except Exception as e:
        print(f"Error in dashboard user_activity {str(e)}")
        user_activity =[]

    try:
        page_wise_hit = VisitorActivity.objects.filter(page_type = VisitorActivity.HIT).values("url").annotate(count = Count("id")).order_by("-count")
    except:
        page_wise_hit = []

    print("page_wise_hit is ",page_wise_hit)

    try:
        page_wise_exit = VisitorActivity.objects.filter(page_type = VisitorActivity.EXIT).values("url").annotate(count = Count("id")).order_by("-count")
    except:
        page_wise_exit = []

    print("page_wise_exit is ",page_wise_exit)

    try:
        page_wise_hit_exit = VisitorActivity.objects.filter(page_type__in=[VisitorActivity.HIT, VisitorActivity.EXIT]).values("url").annotate(
                                                                    hit= Coalesce(Sum(
                                                                        Case(When(page_type = VisitorActivity.HIT, then = 1), default =0 , output_field = IntegerField())
                                                                    ),0),
                                                                    exit= Coalesce(Sum(
                                                                        Case(When(page_type = VisitorActivity.EXIT, then = 1), default =0 , output_field = IntegerField())
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
        temp["url"] = page_name[data["url"]] if data["url"] in page_name else data["url"]
        temp["duration"] = data["duration"]
        temp["hit"] = data["hit"]
        temp["exit"] = data["exit"]
        page_name_hit_exit.append(temp)

    try:
        country_wise_hit_exit = VisitorActivity.objects.filter(page_type__in=[VisitorActivity.HIT, VisitorActivity.EXIT]).values("url").annotate(
                                                                    hit= Coalesce(Sum(
                                                                        Case(When(page_type = VisitorActivity.HIT, then = 1), default =0 , output_field = IntegerField())
                                                                    ),0),
                                                                    exit= Coalesce(Sum(
                                                                        Case(When(page_type = VisitorActivity.EXIT, then = 1), default =0 , output_field = IntegerField())
                                                                    ),0),
                                                                    duration = Sum("duration")
                                                                )
    except Exception as e:
        print("error in page wise hit and exit ",str(e))
        country_wise_hit_exit =[]

    try:
        total = VisitorActivity.objects.values("ip_address").annotate(total_duration=Sum("duration")).aggregate(total_duration_sum=Sum("total_duration"), total_address=Count("ip_address"))
    except Exception as e:
        print(f"Error in dashboard {str(e)}")
        total =[]

    total_duration_sum = total.get('total_duration_sum')
    total_address = total.get('total_address')

    return render(request, "dashboard.html", locals())

def journey(request):
    try:
        user_activity = VisitorActivity.objects.filter(ip_address= request.GET.get("ip_address"), timestamp__date = request.GET.get("date")).values("ip_address","timestamp","duration","url","page_type")
    except Exception as e:
        print("raise exception in journey",str(e))
        user_activity = []

    return render(request, "journey.html", locals())

def index(request):

    return render(request, "index.html")

def contact(request):
    return render(request, "contact_us.html")

def about(request):
    return render(request, "about.html")

def pricing(request):
    return render(request, "price.html")

def features(request):
    return render(request, "features.html")