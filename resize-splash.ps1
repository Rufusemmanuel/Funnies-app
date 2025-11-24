Add-Type -AssemblyName System.Drawing

$sourcePath = "public/images/splashscreen/splash.jpg"
$destPath = "public/images/splashscreen/splash-1080x1920.png"
$destWidth = 1080
$destHeight = 1920

$src = [System.Drawing.Image]::FromFile($sourcePath)
$bmp = New-Object System.Drawing.Bitmap($destWidth, $destHeight)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = "HighQualityBicubic"
$g.SmoothingMode = "HighQuality"
$g.PixelOffsetMode = "HighQuality"
$g.DrawImage($src, 0, 0, $destWidth, $destHeight)
$bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
$src.Dispose()
