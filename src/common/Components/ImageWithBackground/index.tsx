import './styles.scss';

function ImageWithBackground({ src }: { src: string }) {
  return (
    <div className="image-with-background">
      <div style={{ background: `url("${src}")` }} className="image-fill" />
      <div
        style={{ background: `url("${src}")` }}
        className="image-fill-close"
      />
      <img src={src} />
    </div>
  );
}

export default ImageWithBackground;
