var timerId;
var timeLeft = 60;

function hideXirclspopup1() {
   console.log("hide")
   document.getElementById("xircls_btn_popup").style.transition = '0.3s'
   document.getElementById("xircls_popup_box1").style.opacity = '0';
   document.getElementById("xircls_btn_popup").style.opacity = '1';
   setTimeout(() => {
      document.getElementById("xircls_popup_box1").style.display = 'none'
      document.getElementById("xircls_btn_popup").style.display = 'block'
   }, 300)
   document.getElementById("xircls_backdrop").style.display = 'none'
   clearTimeout(timerId);
}

function Show_XIRCLS_POPUP() {
   
   var offer_list_data = JSON.parse(localStorage.getItem('offer_list_data'))

   
   if(offer_list_data) {
      if(offer_list_data.offer_list.length > 0) {
         append_popUp(offer_list_data)
      }
   }

   document.getElementById("xircls_btn_popup").style.transition = '0.3s'

   console.log("show")
   document.getElementById("XIRCLS_POPUP_THEME").style.display = 'block'
   document.getElementById("xircls_popup_box1").style.opacity = '1';
   document.getElementById("xircls_btn_popup").style.opacity = '0';
   setTimeout(() => {
      document.getElementById("xircls_popup_box1").style.display = 'block'
      document.getElementById("xircls_btn_popup").style.display = 'none'
   }, 300)
   document.getElementById("xircls_backdrop").style.display = 'block'
   
}

function show_info() {
   console.log("00000")
   document.querySelector(".show_info").style.height = "402px";
   document.querySelector(".hide_info").style.display = 'block';
}

function hide_info() {
   console.log("00000")
   document.querySelector(".show_info").style.height = "0px";
   document.querySelector(".hide_info").style.display = 'none';
}

function read_more() {
   console.log("ppppp")
   document.querySelector(".read_more").style.height = "auto";
   document.querySelector(".show_read_more").style.display = 'block';
   document.querySelector(".readmore_link").style.display = 'none';

}

function read_less() {
   console.log("ppppp")
   document.querySelector(".read_more").style.height = "0px";
   document.querySelector(".show_read_more").style.display = 'none';
   document.querySelector(".readmore_link").style.display = 'initial';

}

function clearErorr(id) {
   var input = document.getElementById(`${id}`)
   input.innerHTML = ""
}

function change_input() {
   var count = document.querySelectorAll("#XIRCLS_POPUP_THEME .dynamic_offers .xircls_offer").length

   if(count > 0) {
      document.querySelector("#XIRCLS_POPUP_THEME .offer_section").style.width = "100%"
      document.querySelector("#XIRCLS_POPUP_THEME .offers_div").style.display = "block" 
   }else{ 
      document.querySelector("#XIRCLS_POPUP_THEME #check_offer_btn").style.display = 'none';
      document.querySelector("#XIRCLS_POPUP_THEME #check_offer_input").style.display = 'block';
      document.querySelector("#XIRCLS_POPUP_THEME #check_offer_input").style.opacity = '1';
   }
   
 }

 function backtoCheck() {
   document.querySelector("#XIRCLS_POPUP_THEME #check_offer_input").style.display = 'none';
   document.querySelector("#XIRCLS_POPUP_THEME #check_offer_btn").style.opacity = '1';
   document.querySelector("#XIRCLS_POPUP_THEME #check_offer_btn").style.display = 'flex';
   document.querySelector("#input1").value = "";
   document.querySelector("#input2").value = "";
   document.querySelector("#XIRCLS_POPUP_THEME .otp_input").style.display = 'none';
   document.querySelector("#XIRCLS_POPUP_THEME .otp_input_btn").style.display = 'none';
   document.querySelector("#XIRCLS_POPUP_THEME .contact_input").style.display = 'flex';
   document.querySelector("#XIRCLS_POPUP_THEME .contact_input_btn").style.display = 'flex';
   
   clearTimeout(timerId);

 }



function get_opt() {
   var mobile = document.querySelector('#XIRCLS_POPUP_THEME #input1').value
   var form_data = new FormData()
   var boolResult = true
   var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
   timeLeft = 60
   if(boolResult == true) {
      if(mobile == "") {
      var mobile_span = document.querySelector('#XIRCLS_POPUP_THEME #input1_val')
      mobile_span.innerHTML = ""
      mobile_span.append(`Please enter your email or mobile number.`)
      boolResult = false
      }
      else{
         boolResult = true
         if(mobile.match(mailformat)){
         form_data.append('value', "email")
         }else{
         form_data.append('value', "number")
         }
         document.querySelector('#XIRCLS_POPUP_THEME #XIRCLS_btn').innerHTML = '<div class="xircls_loader"></div>';
      }
   }

    
    
   form_data.append("contact", mobile)
   form_data.append("shop", Shopify.shop)

   if(boolResult == true) {
      fetch(`https://www.xircls.com/shopify_verification/`, {
      method: "POST",
      body: form_data
      })
      .then((result) => result.json())
      .then((response) => {
         document.querySelector(".contact_input").style.display = 'none';
         document.querySelector(".contact_input_btn").style.display = 'none';
         document.querySelector(".otp_input").style.display = 'flex';
         document.querySelector(".otp_input_btn").style.display = 'flex';
         localStorage.setItem('verificatiion_code', JSON.stringify(response))
         document.querySelector('#XIRCLS_POPUP_THEME #XIRCLS_btn').innerHTML = 'Send OTP';
         

         pop_up_toastr('OTP Sent. Check Inbox')
     
	
	
         
	      timerId = setInterval(countdown, 1000);
	
	

      })
       .catch((error) => {
         console.error('Error:', error);
         document.querySelector('#XIRCLS_POPUP_THEME #XIRCLS_btn').innerHTML = 'Send OTP';
      });
   }
}


function countdown() {
   var elem = document.getElementById('xircls_otp_counter');
   if (timeLeft == -1) {
      clearTimeout(timerId);
      doSomething();
   } else {
      if(timeLeft == 0){
         elem.innerHTML = `<span onclick="set()" style="text-decoration: underline !important; color: #2e82cb !important; cursor: pointer !important">Resend OTP</span>`
         document.getElementById("input2").disabled = true;
      }else{
         try{
            elem.innerHTML =` ${timeLeft} seconds remaining`;
            timeLeft--;
         }catch(error) {
            console.log(error)
            clearTimeout(timerId);
         }
         
      }
      
   }
}

function set() {
   timeLeft = 60
   clearTimeout(timerId);
   document.getElementById("input2").disabled = false;
   get_opt()
}


function check_otp() {
   var saved_code = JSON.parse(localStorage.getItem('verificatiion_code'))
   document.querySelector('#input2_val').innerHTML = '';
   var value = document.querySelector('#XIRCLS_POPUP_THEME #input2').value
    if(saved_code) {
       console.log(saved_code.otp, typeof(saved_code.otp))
       if(saved_code.otp == value.trim()){
         console.log("perfect")
         document.querySelector('#XIRCLS_POPUP_THEME #XIRCLS_btn1').innerHTML = '<div class="xircls_loader"></div>';
         clearTimeout(timerId);
         Check_Offers()
       }else{
         console.log("wrong")
         document.querySelector('#input2_val').innerHTML = 'OTP entered is incorrect.';
         document.querySelector('#XIRCLS_POPUP_THEME #XIRCLS_btn1').innerHTML = 'Verify me!';
         // clearTimeout(timerId);
       }
    }
 }

function Check_Offers() {
   var json = JSON.parse(localStorage.getItem('verificatiion_code'))
   document.querySelector('#input1').value = ''
   document.querySelector('#input2').value = ''
   console.log(json.contact)
   if(json.contact){
      var mobile = json.contact
      var value = json.value
   }else{
      var mobile = document.getElementById('input1').value
   }

   var form_data = new FormData();
   form_data.append("shop",Shopify.shop);
   form_data.append("contact",mobile);
   form_data.append("value",value);

   
   fetch(`https://www.xircls.com/shopify_check_offers/`, {
      method: "POST",
      body: form_data
   })
   .then((result) => result.json())
   .then((response) => {
      console.log(response)
      append_popUp(response)

   })
   .catch((error) => {
      console.error('Error:', error);
      document.querySelector('#XIRCLS_POPUP_THEME #XIRCLS_btn1').innerHTML = 'Verify me!'
   });

}

function append_popUp(response) {

   fetch(window.Shopify.routes.root + 'cart.js')
   .then(resp => resp.json())
   .then(data => {
      
      document.querySelector('#XIRCLS_POPUP_THEME #XIRCLS_btn1').innerHTML = 'Verify me!';
      document.querySelector("#XIRCLS_POPUP_THEME .otp_input").style.display = 'none';
      document.querySelector("#XIRCLS_POPUP_THEME .otp_input_btn").style.display = 'none';
      
      if(document.getElementById('xircls_theme_number').value == "theme3"){

      }else{
         document.querySelector("#XIRCLS_POPUP_THEME .contact_input").style.display = 'flex';
         document.querySelector("#XIRCLS_POPUP_THEME .contact_input_btn").style.display = 'flex';
      }
      
      document.querySelector('#XIRCLS_POPUP_THEME .dynamic_offers').innerHTML = '';
      var shop = Shopify.shop
      var is_login = ShopifyAnalytics.meta.page.customerId

      if (response.privilege_obj.length > 0) {
         console.log('aasas')
         backtoCheck()
         document.querySelector('#offer_header').innerHTML = 'Instant VIP Benefits Unlocked!';
         response.privilege_obj.map((curElem, index) => {
            var { outlet_logo, outletname, reward_subcategory, max_allowed_amount, spon_reward_id, cust_id, cust_name, fixed_amount, product_id, product_name, variant_id } = curElem

            document.querySelector('#XIRCLS_POPUP_THEME .dynamic_offers').innerHTML += `
               <div id="${index}" class="${index} xircls_offer" style="border-radius: 10px; background-color: #fff; box-shadow: rgb(0 0 0 / 30%) 0px 1px 5px !important; margin: auto auto 25px auto; padding: 12px">
                  <div class="image xircls_main_offer_image" style="padding-bottom: 20px;text-align: center;">
                     <p>Welcome, ${cust_name}!</p>
                     <p style="font-weight: 600;">You’re a Privileged Customer of <br> ${outletname}</p>
                     <img src="${outlet_logo}" style="width: 70px; margin-bottom: 10px" />
                     <p>${outletname} has sponsored a ${product_name} (Rs. ${fixed_amount}).</p>
                     <p>Click on redeem to add this to cart.</p>
                     <small style="font-size: 11px;">Note: The discounted amount will be pre-applied at checkout.</small>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center">
                     <a onclick="hide_offers_div()" style="text-decoration: none; padding: 6px 15px; background: transparent; color: #000; border-radius: 5px; border: 1px solid #000; cursor: pointer; font-size: 12px; display: flex; justify-content: center; align-items: center;">Not Now</a>
                     <a onclick="infinity_redeem_offer_now('outlet', '${shop}', '${cust_id}', '${cust_name}', '${fixed_amount}', '${spon_reward_id}', '${data.total_price}', '${index}', '${is_login}',' ${product_id}',' ${variant_id}' )" class="unique_btn_color redeem_btn${index}" style="text-decoration: none; padding: 7px 15px; background: #000; color: #fff; border-radius: 5px; font-size: 12px; display: flex; justify-content: center; align-items: center; cursor: pointer;">Redeem</a>
                  </div>
               </div>
            `
         })
      }


      if(response.offer_list.length > 0) {
         
         backtoCheck()
         var background_color = document.querySelector("#pick_colors").style.backgroundColor 
         var color = document.querySelector("#pick_colors").style.color 
         var radius = document.querySelector("#pick_colors").style.borderRadius
         var btn_url = document.querySelector("#append_url").value
         document.querySelector('#offer_header').innerHTML = 'Instant VIP Benefits Unlocked!';
         response.offer_list.map((curElem, index) => {
            var {outlet_logo, is_percent, call_to_action, outlet_name, offer_image, offer_code, offer_id, btn_name, btn_url, shop_outlet, outlet_id, kit_id, short_description, offer_savings_value } = curElem
            if (offer_code == "WRAPB1G1") {

            }else{
               var image_bool = document.getElementById('is_offer_image').value
               if (is_percent) {
                  amount_code = `${offer_savings_value}% OFF`
               }else{
                  amount_code = `₹${offer_savings_value} OFF`
               }
               var btn_text = call_to_action ? call_to_action : "Redeem"
               if(document.getElementById('xircls_theme_number').value == "theme3") {
                  document.querySelector('#XIRCLS_POPUP_THEME .dynamic_offers').innerHTML += `
                  <div class="offer_box" style="background-color: #efefef; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px">
                     <div style="font-style: normal; font-weight: 600; font-size: 14px; line-height: 20px; color: #000; text-align: left">${short_description}</div>
                     <div class="remove_col" style="display: flex; justify-content: center; align-items: flex-end; flex-direction: column; gap: 15px;">
                        <div style="display: flex; justify-content: center; align-items: center; gap: 10px">
                           <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M15.0575 7.685L8.3075 0.935C8.0375 0.665 7.6625 0.5 7.25 0.5H2C1.175 0.5 0.5 1.175 0.5 2V7.25C0.5 7.6625 0.665 8.0375 0.9425 8.315L7.6925 15.065C7.9625 15.335 8.3375 15.5 8.75 15.5C9.1625 15.5 9.5375 15.335 9.8075 15.0575L15.0575 9.8075C15.335 9.5375 15.5 9.1625 15.5 8.75C15.5 8.3375 15.3275 7.955 15.0575 7.685ZM3.125 4.25C2.5025 4.25 2 3.7475 2 3.125C2 2.5025 2.5025 2 3.125 2C3.7475 2 4.25 2.5025 4.25 3.125C4.25 3.7475 3.7475 4.25 3.125 4.25Z" fill="#000"/>
                           </svg>
                           <div style="font-style: normal; font-weight: 600; font-size: 16px; line-height: 30px; color: #000;">${offer_code}</div>
                        </div>
                        <a href="${btn_url}" style="text-transform: uppercase; height: 32px; font-weight: 600; font-size: 13px; line-height: 30px; text-align: center; background-color: ${background_color}; color: ${color}; border-radius: 7px; display: flex; justify-content: center; align-items: center; cursor: pointer; padding: 0 15px; text-decoration: none; white-space: nowrap">${btn_text}</a>
                     </div>
                  </div>

                  `
               } else{

                  if(image_bool == 'true') {
                     document.querySelector('#XIRCLS_POPUP_THEME .dynamic_offers').innerHTML += `
                        <div id="${offer_id}" class="${index} xircls_offer" style="border-radius: 10px; background-color: #fff; box-shadow: rgb(0 0 0 / 30%) 0px 1px 5px !important; margin: auto auto 25px auto; padding: 12px">
                           <div class="image xircls_main_offer_image" style="padding-bottom: 15px;">
                              <img id="background_image_${index}" style="border-radius: 5px;" width="100%" src="https://www.xircls.com/static/${offer_image}" alt="">
                              <p style="font-size: 11px !important;margin: 5px 0px 0px 0px !important;font-family: 'Montserrat';letter-spacing: 0.3px;line-height: 1.5; color: #464646;">${short_description}</p>
                           </div>
                           <div style="display: flex; justify-content: space-between; align-items: center">
                              <p style="margin: 0;font-size: 14px;font-weight: 600;font-family: 'Montserrat';display: flex;justify-content: center;align-items: flex-start;flex-direction: column;letter-spacing: 1px; color: #464646">
                                 ${offer_code}
                                 <span style="font-size: 11px !important;letter-spacing: 0%;line-height: 1.5; padding: 0px; margin: 0px;">
                                    ${amount_code}
                                 </span>
      
                              </p>
                              <a href="${curElem.btn_url}" class="unique_btn_color" style="text-decoration: none; padding: 6px 13px; background: #000; color: #fff; border-radius: 5px; font-size: 12px; display: flex; justify-content: center; align-items: center; cursor: pointer !important;font-weight: 600;text-transform: uppercase;letter-spacing: 1.2px;">${btn_text}</a>
                           </div>
                        </div>
                        <span id="code${index}" style ="display:none;">${offer_code}</span>
      
                     `
   
                  }else{
                     document.querySelector('#XIRCLS_POPUP_THEME .dynamic_offers').innerHTML += `
                        <div id="${offer_id}" class="${index} xircls_offer" style="border-radius: 10px; background-color: #fff; box-shadow: rgb(0 0 0 / 30%) 0px 1px 5px !important; margin: auto auto 25px auto; padding: 12px">
                           <div class="image xircls_main_offer_image" style="padding-bottom: 15px;">
                              <p style="font-size: 14px !important; font-weight: 600; margin: 5px 0px 0px 0px !important;font-family: 'Montserrat';letter-spacing: 0.3px;line-height: 1.5; color: #464646">${short_description}</p>
                           </div>
                           <div style="display: flex; justify-content: space-between; align-items: center">
                              <p style="margin: 0;font-size: 12px;font-weight: 600;font-family: 'Montserrat';display: flex;justify-content: center;align-items: flex-start;flex-direction: column;letter-spacing: 1px; color: #464646">
                                 ${offer_code}
                                 <span style="font-size: 11px !important;letter-spacing: 0%;line-height: 1.5; padding: 0px; margin: 0px;"> 
                                    ${amount_code}
                                 </span>
      
                              </p>
                              <a href="${curElem.btn_url}" class="unique_btn_color" style="text-decoration: none; padding: 6px 13px; color: ${color}; background: ${background_color}; border-radius: 5px; font-size: 12px; display: flex; justify-content: center; align-items: center; cursor: pointer !important;font-weight: 600;text-transform: uppercase;letter-spacing: 1.2px;">${btn_text}</a>
                           </div>
                        </div>
                        <span id="code${index}" style ="display:none;">${offer_code}</span>
      
                     `
                  }
               }
            }
            
         })
      }

      if (response.privilege_obj.length == 0 && response.offer_list.length == 0) {
         
         var background_color = document.querySelector("#check_offer_btn").style.backgroundColor 
         var color = document.querySelector("#check_offer_btn").style.color 
         var radius = document.querySelector("#check_offer_btn").style.borderRadius
         var btn_url = document.querySelector("#append_url").value

         document.querySelector('#offer_header').innerHTML = 'Instant VIP Benefits'
         console.log(background_color, color, radius, btn_url)
         document.querySelector('#XIRCLS_POPUP_THEME .dynamic_offers').innerHTML = `
            <div style="text-align: center;">
               <h4 style="margin-bottom: 15px !important; font-size: 15px">You don't have any offers from us yet!</h4>
               <a href="${btn_url}" class="xircls_theme_btn unique_btn_color" style="display: block; margin: 1rem auto auto; border: medium none; padding: 0.5rem 1rem; border-radius: ${radius};color: ${color}; background: ${background_color}; cursor: pointer; transition: all 0.3s ease-in-out 0s; font-family: Ubuntu-Regular; width: 200px; text-align: center; text-transform: uppercase; font-size: 12px; font-weight: bold; text-decoration: none">Start Shopping</a>

            </div>
         `
      }else {
         localStorage.setItem('offer_list_data', JSON.stringify(response))
      }

      show_offers_div()
   })
   .catch((error) => {
      console.log(error, "cartjs")
   })
}

function infiniti_copy(id, url) {
   var r = document.createRange();
   r.selectNode(document.getElementById(id));
   window.getSelection().removeAllRanges();
   window.getSelection().addRange(r);
   document.execCommand('copy');
   window.getSelection().removeAllRanges();
   
      if(r){
         console.log('True')
         //   toastr.success("Copied!")
         window.open(url);
      }
   }

function infinity_redeem_offer_now(outlet, shop, cust_id, cust_name, max_allow_amt, spon_reward_id, cart, index, is_login, product_id, variant_id ) {
   document.querySelector('.redeem_btn'+index).innerHTML = '<div class="xircls_loader"></div>'
   if(is_login == undefined || is_login == 'undefined') {
      console.log("Please sign up or login to redeem")
      pop_up_toastr('Please sign up or login to redeem')
      document.querySelector('.redeem_btn'+index).innerHTML = 'Redeem'
      // $(".redeem_btn"+index).html(`Redeem`)
   }else{
      var form_data = new FormData()
      console.log(is_login)
      var shop_name = Shopify.shop
      var cur_url = location.href
   
      form_data.append("outlet",outlet);
      form_data.append( "shop", shop);
      form_data.append("cust_id", cust_id);
      form_data.append("cust_name", cust_name);
      form_data.append("fixed_amount", max_allow_amt);
      form_data.append("reward_id", spon_reward_id);
      form_data.append("cart_amount", cart);
      form_data.append("shopify_customer_id", is_login);
      form_data.append("product_id", product_id);
      fetch(`https://www.xircls.com/api/v2/add_coupon/`, {
         method: "POST",
         body: form_data
      })
      .then((result) => result.json())
      .then((response) => {
         console.log(response)
         document.querySelector('.redeem_btn'+index).innerHTML = 'Redeem'
         let formData = {
         'items': [{
            'id': variant_id,
            'quantity': 1
            }]
         };
         console.log("inn")
         fetch(window.Shopify.routes.root + 'cart/add.js', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
         })
         .then(res => {
            console.log('success')
            infinity_send_url(`unique_code_${index}`, `https://${shop_name}/discount/${response.offer.ref_code}?redirect=${cur_url}`)
            return res.json();
         })
         .catch((error) => {
            console.error('Error:', error);
         });
         
      })
      .catch((error) => {
         console.error('Error:', error);
         document.querySelector('.redeem_btn'+index).innerHTML = 'Redeem'
       });
   }
}
// privilege
function infinity_send_url(id, url) {
   console.log(url)
   window.location = url
}

function show_offers_div() {
   console.log('show_offers_div')

   document.querySelector("#XIRCLS_POPUP_THEME .offer_section").style.width = "100%"
   document.querySelector("#XIRCLS_POPUP_THEME .offers_div").style.display = "block"
}

function hide_offers_div() {
   try{
      minimize_offers_div()
   }catch(error) {
      console.log(error)
   }
   console.log('hide_offers')
   document.querySelector("#XIRCLS_POPUP_THEME .offer_section").style.width = "0%"
   document.querySelector("#XIRCLS_POPUP_THEME .offers_div").style.display = "none"

}

function show_category() {
   console.log("category")
   document.querySelector("#XIRCLS_POPUP_THEME .xircls_categories").style.width = "100%"
   document.querySelector("#XIRCLS_POPUP_THEME .hide_category").style.display = "block"

}

 function hide_category() {
   console.log('hide category')
   document.querySelector("#XIRCLS_POPUP_THEME .xircls_categories").style.width = "0%"
   document.querySelector("#XIRCLS_POPUP_THEME .hide_category").style.display = "none"

}

 function send_invite() {
   document.querySelector('#XIRCLS_POPUP_THEME #invite_email').innerHTML = '<div class="xircls_loader"></div>'
   var form_data = new FormData()

    form_data.append('merchant_email', document.querySelector('#XIRCLS_POPUP_THEME #send_invite_mail').value)
    form_data.append('shop', Shopify.shop )
    fetch(`https://www.xircls.com/shopify_invite_a_business/`, {
         method: "POST",
         body: form_data
      })
      .then((result) => result.json())
      .then((resp) => {
         console.log(resp)
         document.querySelector('#XIRCLS_POPUP_THEME #invite_email').innerHTML = '<img src="https://www.xircls.com/static/images/sprite_icons/send.svg" style="width: 23px;">'
         document.querySelector('#XIRCLS_POPUP_THEME #send_invite_mail').value = ''
         
      })
      .catch((error) => {
         console.log(error)
         document.querySelector('#XIRCLS_POPUP_THEME #invite_email').innerHTML = '<img src="https://www.xircls.com/static/images/sprite_icons/send.svg" style="width: 23px;">'
         document.querySelector('#XIRCLS_POPUP_THEME #send_invite_mail').value = ''
         
      });
 }

 function submit_category() {
   document.querySelector('#XIRCLS_POPUP_THEME #submit_category_id').innerHTML = '<div class="xircls_loader"></div>'
    let arr = [];
    let checkboxes = document.querySelectorAll("#main__div input[type='checkbox']:checked");
    for (let i = 0 ; i < checkboxes.length; i++) {
     arr.push(checkboxes[i].value)
    }
    console.log(arr)

    var form_data = new FormData()

      form_data.append('shop',Shopify.shop)
      form_data.append('categories', arr)
      form_data.append('contact', document.querySelector('#submit_category_input').value)


      fetch(`https://www.xircls.com/save_shopify_categories/`, {
         method: "POST",
         body: form_data
      })
      .then((result) => result.json())
      .then((resp) => {
         console.log(resp)
         document.querySelector('#XIRCLS_POPUP_THEME #submit_category_id').innerHTML = 'Submit'
         document.querySelector('#submit_category_input').value = ""
         hide_category()
      })
      .catch((error) => {
         console.log(error)
         document.querySelector('#XIRCLS_POPUP_THEME #submit_category_id').innerHTML = 'Submit'
      });

 }


function collabrate_type() {
   var value = document.querySelector('#xircls_radio .xircls_r_class:checked').value;
   
   document.querySelector('#cust_email').value =''
   document.querySelector('#cust_mobile').value =''
   document.querySelector('#bor_website_url').value =''
   document.querySelector('#infl_social_url').value =''

   console.log(value)
   var default_sent_len = document.querySelectorAll('.default_sent')
   var xircls_bor_len = document.querySelectorAll('.xircls_bor')
   var category_submit_len =  document.querySelectorAll('.category_submit')
   var main_btn_xircls_len = document.querySelectorAll('.main_btn_xircls')
   var xircls_inf_len = document.querySelectorAll('.xircls_inf')
   var xircls_cust_len = document.querySelectorAll('.xircls_cust')

   for(x = 0; x < default_sent_len.length; x++){
      default_sent_len[x].style.display ='none'
   }

   
   // $('.default_sent').hide()
   if(value == "Business owner or representative") {
      console.log("BOR")
      try{
         for(x = 0; x < main_btn_xircls_len.length; x++){
            main_btn_xircls_len[x].style.display ='flex'
         }
      }catch(error) {
         console.log(error)
      }
      
      try{
         for(x = 0; x < category_submit_len.length; x++){
            category_submit_len[x].style.display ='none'
         }
      }catch(error) {
         console.log(error)
      }
      
      for(x = 0; x < xircls_bor_len.length; x++){
         xircls_bor_len[x].style.display ='block'
      }

   }else if(value == "Influencer") {
      console.log("Infl")
      try{
         for(x = 0; x < xircls_inf_len.length; x++){
            xircls_inf_len[x].style.display ='block'
         }
      }catch(error) {
         console.log(error)
      }
      
      try{
         for(x = 0; x < main_btn_xircls_len.length; x++){
            main_btn_xircls_len[x].style.display ='flex'
         }
      }catch(error) {
         console.log(error)
      }

      try{
         for(x = 0; x < category_submit_len.length; x++){
            category_submit_len[x].style.display ='none'
         }
      }catch(error) {
         console.log(error)
      }
   }else{
      console.log("Cust")
      for(x = 0; x < xircls_cust_len.length; x++){
         xircls_cust_len[x].style.display ='flex'
      }
      try{
         for(x = 0; x < main_btn_xircls_len.length; x++){
            main_btn_xircls_len[x].style.display ='none'
         }
      }catch(error) {
         console.log(error)
      }
      
      try{
         for(x = 0; x < category_submit_len.length; x++){
            category_submit_len[x].style.display ='flex'
         }
      }catch(error) {
         console.log(error)
      }
   }

}

function xircls_isValidURL(string) {
   var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
   return (res !== null)
};

function submit_invite() {
   var input_val = document.querySelector('#cust_email').value
   var cust_mobile = document.querySelector('#cust_mobile').value
   var bor_website_url = document.querySelector('#bor_website_url').value
   var website_link = xircls_isValidURL(bor_website_url)
   var infl_social_url = document.querySelector('#infl_social_url').value
   var social_link = xircls_isValidURL(infl_social_url)
   var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
   var bool =true

   var value = document.querySelector('#xircls_radio .xircls_r_class:checked').value;

   if(bool) {
      if(input_val.match(mailformat)){
         bool = true
      }else{
         document.querySelector('#cust_email_val').innerHTML = 'Please enter your title'
         bool = false
         hide_category()
      }
   }
   if(bool) {
      if(cust_mobile == "" && cust_mobile.length <= 10) {
         document.querySelector('#cust_mobile_val').innerHTML = 'Please enter your phone no.'
         bool = false
         hide_category()
      }else{
         bool = true
      }
   }

   if(value == "Business owner or representative"){
      if(bool) {
         if(!website_link) {
            document.querySelector('#bor_website_url_val').innerHTML = 'Please enter your website url.'
            bool = false
         }else{
            bool = true
         }
      }

   }else if (value == "Influencer") {
      
      if(bool) {
         if(!social_link) {
            document.querySelector('#infl_social_url_val').innerHTML = 'Please enter your social media url.'
            bool = false
         }else{
            bool = true
         }
      }
   }else if (value == "Customer") {
      
      if(document.querySelectorAll("#main__div input[type='checkbox']:checked").length == 0) {
         document.querySelector('#main__div_val').innerHTML = 'Please select any one category.'
         bool = false
      }else{
         bool = true
      }
   }

   if(bool) {
      hide_category()

      var bor_email = document.querySelector('#cust_email').value
      var bor_mobile =  document.querySelector('#cust_mobile').value
      var code = document.querySelector('#xircls_phone_code').value
      var bor_website_url = document.querySelector('#bor_website_url').value
      var infl_social_url = document.querySelector('#infl_social_url').value
      let arr = [];
      let checkboxes = document.querySelectorAll("#main__div input[type='checkbox']:checked");
      for (let i = 0 ; i < checkboxes.length; i++) {
         arr.push(checkboxes[i].value)
      }
      console.log(arr)

      var form_data = new FormData()

      form_data.append('merchant_email', bor_email)
      form_data.append('mobile', bor_mobile)
      form_data.append('code', code)
      form_data.append('website_url', bor_website_url)
      form_data.append('social', infl_social_url)
      form_data.append('type', value)
      form_data.append('shop', Shopify.shop)
      form_data.append('category', arr)

      document.querySelector('#XIRCLS_POPUP_THEME .submit_categories_xircls').innerHTML = '<div class="xircls_loader"></div>'

      fetch(`https://www.xircls.com/shopify_invite_a_business/`, {
         method: "POST",
         body: form_data
      })
      .then((result) => result.json())
      .then((resp) => {
         console.log(resp)
         document.querySelector('#XIRCLS_POPUP_THEME .submit_categories_xircls').innerHTML = 'Submit'
         hide_category()
         document.querySelector('#cust_email').value =''
         document.querySelector('#cust_mobile').value =''
         document.querySelector('#bor_website_url').value =''
         document.querySelector('#infl_social_url').value =''
         
         pop_up_toastr('Thank you for your interest! Check your inbox.')

      })
      .catch((error) => {
         console.log(error)
         document.querySelector('#XIRCLS_POPUP_THEME .submit_categories_xircls').innerHTML = 'Submit'
      });
   }
}

// privelige
function pop_up_toastr(text) {
   document.querySelector("#toastr-container").style.zIndex = '100002'
   document.querySelector('.xircls_toastr').style.opacity = 1
   document.querySelector('#text_for_toastr').innerHTML =text 
   setTimeout(() => {
      document.querySelector('.xircls_toastr').style.opacity = 0
   }, 2500)
   
   
}


function infinity_clasePop_up() {
   setTimeout(() => {
      document.getElementById('XIRCLS_popup_on_load').style.display = 'none'
   })
	document.getElementById('XIRCLS_popup_on_load').style.opacity = '0'

}

function inf_next_slide_privilege(index) {
	console.log(index)
   var next = Number(index) + 1
   var tranform_value = document.querySelector(`.inf_pop_on_load_${index}`).offsetWidth * next + 20
	document.getElementById(`infinity_onload_append`).style.transform = `translateX(-${tranform_value}px)`
}

function inf_back_slide_privilege(index) {
	console.log(index)
   console.log(index)
   var next = Number(index) - 1
   var tranform_value = document.querySelector(`.inf_pop_on_load_${index}`).offsetWidth * next + 20
	document.getElementById(`infinity_onload_append`).style.transform = `translateX(-${tranform_value}px)`
}

function check_offers_again() {
   document.querySelector('#XIRCLS_POPUP_THEME .dynamic_offers').innerHTML = '';
   localStorage.setItem('offer_list_data', null)
   hide_offers_div()
   change_input()
}

function maximize_offers_div() {
   document.getElementById('maximize_icon').style.display = 'none'
   document.getElementById('minimize_icon').style.display = 'block'
   document.querySelector('.sm_remove_image').style.display = 'none'
   document.querySelector('.offer_section').style.right = ''
   document.querySelector('.offer_section').style.width = '583px'
}

function minimize_offers_div() {
   document.getElementById('maximize_icon').style.display = 'block'
   document.getElementById('minimize_icon').style.display = 'none'
   document.querySelector('.sm_remove_image').style.display = 'block'
   document.querySelector('.offer_section').style.right = '0'
   document.querySelector('.offer_section').style.width = '100%'
}