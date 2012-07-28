<?php 
/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/webservices/estudy/getTeacherCourses.js
 - Beschreibung: Holt alle eStudy-Kurse eines Dozenten.
 - Version:      1.0, 01/05/12
 - Autor(en):    Christian Thomas Weber <christian.t.weber@gmail.com>
 +---------------------------------------------------------------------------+
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or any later version.
 +---------------------------------------------------------------------------+
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 +--------------------------------------------------------------------------*/
$login = $_POST['login'];
$url = "https://icampus.thm.de/service/rest/estudy/teacher/$login/courses?orderby=name";

//create a new cURL resource
$curl = curl_init();

// set URL and other appropriate options
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_HEADER, false);
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 2);

echo curl_exec($curl);

if (curl_errno($curl)) {
	print curl_error($curl);
} else {
	curl_close($curl);
}
exit;
?>
