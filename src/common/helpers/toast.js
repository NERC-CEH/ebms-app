export default async function toast(props) {
  const toastEl = document.createElement('ion-toast');

  Object.keys(props).forEach(prop => {
    toastEl[prop] = props[prop];
  });

  document.body.appendChild(toastEl);
  return toastEl.present();
}
