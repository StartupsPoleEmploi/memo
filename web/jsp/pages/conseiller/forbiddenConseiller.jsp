<%@ taglib prefix="pack" uri="https://github.com/d8bitr/packtag" %>
<%@ page contentType="text/html;charset=UTF-8" language="java"%>

<!DOCTYPE html>
<html>
<head>

<link rel="stylesheet" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css" type="text/css" />
<link rel="stylesheet" href="../../../assets/global/css/components.min.css" type="text/css" />
<link rel="stylesheet" href="../../../css/conseiller.css" type="text/css" />
<link rel="shortcut icon" href="../../../pic/favicon.ico" />

<script:pack>
	<script type="text/javascript" src="../../../js/classes/conseiller.js"></script>
	<script src="../../../js/jquery-2.1.3.min.js"></script>
</script:pack>

<meta charset="UTF-8">

<title>Espace Memo Conseiller</title>
</head>

<body>
	<div class="container-fluid">
		<div class="row">
			<div class="col-sm-4" style="background-color: #F7F7F7;">
				<img class="logo" src="../../../pic/conseiller/memoLogo.svg" height="70"
					weight="70" alt="Logo Memo" />
			</div>
			<div class="col-sm-8">
				<div align="center" class="ctn">
					<img src="../../../pic/conseiller/noAccess.png"/><br><br>
					<strong>Cette page est disponible uniquement via le réseau Pôle emploi</strong>					
				</div>
			</div>
		</div>
	</div>
</body>

<script>
	var conseiller = new Conseiller();
	conseiller.logEventToGA('event', 'Conseiller', 'Accès interdit', '');
</script>

</html>