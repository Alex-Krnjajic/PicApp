<?php

logger("start");
$servername = "localhost";
$username = "lab1_wp";
$password = "5tqS88ZCJRsXxtyX";
$dbname = "lab1_wp";

$wp_password = "ire$(UDK^aPmy^3y!l\$P2el&";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);


// Check connection
if ($conn->connect_error) {
  logger("Connection failed");
  die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully \n";
logger("Connected successfully");

$sql_select = "SELECT `id` FROM `Image_storage` ORDER BY id DESC LIMIT 1";
$sql_insert = "INSERT INTO `Image_storage`(`id`, `Image_path`, `Wordpress`) VALUES (?,?,CURRENT_TIMESTAMP)";

$result = $conn->query($sql_select);
$row = $result->fetch_assoc();
$id = $row["id"] + 1;
logger($id);


var_dump($_POST);
$img = $_POST["image"];
//logger($img);
$img_name = $_POST["name"];
logger("date: " . $img_name);
echo "print 1: $img_name \n";
echo "print id: $id \n";
$img_name = $img_name . "_" . "$id.png";
$img = str_replace('data:image/png;base64,', '', $img);
$img = str_replace(' ', '+', $img);
$fileData = base64_decode($img);
$img_path = "./uploads/$img_name";
file_put_contents($img_path , $fileData);
echo "$img_name \n";


$stmt = $conn->prepare($sql_insert);
$stmt->bind_param("is",$id,$img_path);
$stmt->execute();
$stmt->close();

$conn->close();

$status = upload_image($img_path);

$data .= PHP_EOL;
$pathToFile = './debug.log';
file_put_contents($pathToFile, $data, FILE_APPEND);

//echo "request: $status";

function upload_image( $path ) {
  $request_url = 'https://lab1.test.commerz.se/wp-json/wp/v2/media';

  $image = file_get_contents( $path );
 
  $mime_type = mime_content_type( $path );

  $api = curl_init($request_url);

  echo basename($path);

  //set the url, POST data
  curl_setopt( $api, CURLOPT_POST, true );
  curl_setopt( $api, CURLOPT_POSTFIELDS, $image );
  curl_setopt( $api, CURLOPT_HTTPHEADER, [
    'Content-Type: ' . $mime_type,
    'Content-Disposition: attachment; filename="' . basename($path) . '"' 
    ] );
  curl_setopt( $api, CURLOPT_RETURNTRANSFER, true );
  curl_setopt( $api, CURLOPT_HTTPAUTH, CURLAUTH_BASIC );
  curl_setopt( $api, CURLOPT_USERPWD, 'lab1_wp' . ':' . "ire$(UDK^aPmy^3y!l\$P2el&" );

  //execute post
  $result = curl_exec( $api );

  //close connection
  curl_close( $api );
  
  echo $result;
  return json_decode( $result );
};

function logger( $data ){
  $dataToLog = array(
    date("Y-m-d H:i:s"), //Date and time
    "$data"
);
  
  //Turn array into a delimited string using
  //the implode function
  $data = implode(" - ", $dataToLog);
  
  //Add a newline onto the end.
  $data .= PHP_EOL;
  
  //The name of your log file.
  //Modify this and add a full path if you want to log it in 
  //a specific directory.
  $pathToFile = './debug.log';
  
  //Log the data to your file using file_put_contents.
  file_put_contents($pathToFile, $data, FILE_APPEND);
  
  }


?>