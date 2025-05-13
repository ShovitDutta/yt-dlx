export default interface VideoFormat {
  filesize: number;
  filesizeP: string | number;
  format_note: string;
  fps: number;
  height: number;
  width: number;
  tbr: number;
  url: string;
  ext: string;
  vcodec: string;
  dynamic_range: string;
  container: string;
  resolution: string;
  aspect_ratio: number;
  video_ext: string;
  vbr: number;
  format: string;
}
