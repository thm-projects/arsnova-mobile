<?php
	/*--------------------------------------------------------------------------+
	 This file is part of ARSnova.
	 app/webservices/doCasLogin.js
	 - Beschreibung: Regelt den CAS-Login.
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

  	header("Content-Type: application/json");
  	
  	require_once '../../lib/CAS.php';
  	
  	phpCAS::client(CAS_VERSION_2_0, "cas.thm.de", 443, "cas", true);
  		
	// no SSL validation for the CAS server
	phpCAS::setNoCasServerValidation();
	
	phpCAS::setFixedServiceURL('https://ars.thm.de/app/webservices/doCasLogin.php');
	
	phpCAS::handleLogoutRequests(false);
		
	// force CAS authentication
	phpCAS::forceAuthentication();
		
	if(phpCAS::isAuthenticated()) {
		$phpCAS = $_SESSION["phpCAS"];  
		header('Location: ../../#auth/checkCasLogin/' . $phpCAS['attributes']['username']);
	} else {
		echo "0"; 
	}
  	
	exit();
?>
{
	"response": {
		"ticket": "<?php echo $ticket ?>",
		"hash"	: "<?php echo $hash ?>",
		"salt"	: "<?php echo $salt ?>",
		"login"	: "<?php echo $url ?>"
	}
}