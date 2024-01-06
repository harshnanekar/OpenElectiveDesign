
    let elements = document.querySelector("#sidebuttonid");
  
    if (elements) {
      elements.addEventListener('click', function() {
       
        let style = getComputedStyle(document.body);
        let asideValue = style.getPropertyValue("--sidebar");

        if (asideValue === '350px') {
          document.documentElement.style.setProperty("--sidebar", "0px");
        } else {
          document.documentElement.style.setProperty("--sidebar", "350px");
        }
      });
    }

    document.getElementById('mainDiv')?.addEventListener('mouseover',() =>{
      let element = document.querySelectorAll('#mainDiv');
    
         element.forEach( divelement => {
            divelement.addEventListener('mouseover',async () => {
        
               
                divelement.style.backgroundColor ='maroon';
                 divelement.style.scale = '105%';
                divelement.style.transition = 'linear 0.2s';
    
              
          let fonts = divelement.querySelector('#horizontalModule'); // Use querySelector here
          if (fonts) {
            fonts.style.color = 'white';
          }
            });
         });
      
      });
    
    
    document.getElementById('mainDiv')?.addEventListener('mouseout',() => {
    
      let element = document.querySelectorAll('#mainDiv');
      element.forEach( divelement => {
            divelement.addEventListener('mouseout',async () => {
        
               
                divelement.style.backgroundColor ='white';
                divelement.style.scale = '100%';
              
          let fonts = divelement.querySelector('#horizontalModule'); 
          if (fonts) {
            fonts.style.color = 'black';
          }
            });
         });
      
      });
    

