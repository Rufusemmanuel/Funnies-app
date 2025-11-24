# Generates a vibrant 1080x1920 splash image without needing the small source asset.

Add-Type -AssemblyName System.Drawing

$width = 1080
$height = 1920
$output = "public/images/splashscreen/splash-1080x1920.png"

$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = "HighQuality"
$g.InterpolationMode = "HighQualityBicubic"
$g.PixelOffsetMode = "HighQuality"

$rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)

# Bold gradient background
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(255, 110, 75, 255), # purple
    [System.Drawing.Color]::FromArgb(255, 255, 170, 70), # warm orange
    85
)
$g.FillRectangle($bgBrush, $rect)

# Soft accent circles
$circle1 = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(120, 255, 255, 255))
$circle2 = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(90, 80, 200, 255))
$circle3 = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(80, 255, 230, 140))
$g.FillEllipse($circle1, -200, 150, 900, 900)
$g.FillEllipse($circle2, 400, 900, 900, 900)
$g.FillEllipse($circle3, -150, 1100, 750, 750)

# Title text
$titleFont = New-Object System.Drawing.Font("Arial", 140, [System.Drawing.FontStyle]::Bold)
$titleFormat = New-Object System.Drawing.StringFormat
$titleFormat.Alignment = "Center"
$titleFormat.LineAlignment = "Center"
$titleRect = New-Object System.Drawing.RectangleF(0, 560, $width, 200)
$titleBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
$g.DrawString("funnies", $titleFont, $titleBrush, $titleRect, $titleFormat)

# Subtitle
$subtitleFont = New-Object System.Drawing.Font("Arial", 36, [System.Drawing.FontStyle]::Regular)
$subtitleRect = New-Object System.Drawing.RectangleF(0, 740, $width, 120)
$subtitleBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(230, 255, 255, 255))
$subtitleFormat = New-Object System.Drawing.StringFormat
$subtitleFormat.Alignment = "Center"
$subtitleFormat.LineAlignment = "Center"
$g.DrawString("NFT airdrop for early Farcaster supporters", $subtitleFont, $subtitleBrush, $subtitleRect, $subtitleFormat)

$bmp.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)

$titleBrush.Dispose()
$subtitleBrush.Dispose()
$circle1.Dispose()
$circle2.Dispose()
$circle3.Dispose()
$bgBrush.Dispose()
$g.Dispose()
$bmp.Dispose()
