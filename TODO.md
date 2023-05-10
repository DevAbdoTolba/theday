# TODOLIST

## TODO

-check this code to download the website as shortcut app in the home screen (MDN manifest)[https://developer.mozilla.org/en-US/docs/Web/Manifest]
```
function addShortcut() {
  // Check if the Web App Manifest is supported
  if ('navigator' in window && 'standalone' in window.navigator && window.navigator.standalone) {
    alert('The website is already installed as a web app on your device.');
    return;
  }
  
  // Check if the Web Share API is supported
  if (!('share' in navigator)) {
    alert('The Web Share API is not supported on your device.');
    return;
  }
  
  // Prompt the user to add a shortcut to their home screen
  navigator.share({
    title: document.title,
    text: 'Add this website to your home screen',
    url: window.location.href
  })
  .then(() => {
    alert('The website has been added to your home screen.');
  })
  .catch((error) => {
    alert('There was an error adding the website to your home screen: ' + error);
  });
}

```


-

## DOING


## DONE



