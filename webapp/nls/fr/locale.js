define({

		// Menu
		"menu": {
			"auditItem": "audit"
			,"toolsItem": "outils"
			,"configItem": "config"
			,"helpItem": "aide"
			,"aboutItem": "&agrave; propos"
			// Audit
			,"audit": {
				"auto": "Tests automatiques d'accessibilit&eacute;"
				,"autoButton": "d&eacute;marrer"				
			}			
			// Tools page
			,"tools": {
				"alternativeText": "texte alternatif sur les images"
				,"inspector": "inspecteur d'&eacute;l&eacute;ments"
				,"screenReaderView": "vue lecteur d&apos;&eacute;cran"
				,"enableJquery": "activer jQuery"
				,"disableJquery": "désactiver jQuery" /* don't encode this label */
				,"enableJqueryTip": "Activer jQuery pour utiliser dans la console du navigateur à l'aide de la variable $" /* don't encode this label */
				,"disableJqueryTip": "Désactiver jQuery et restaurer la variable $ à sa valeur d'origine" /* don't encode this label */
				,"enableConfort": "activer confort d'utilisation"
				,"enabledConfort": "confort d'utilisation activé"
				,"enableConfortTip": "Activer confort d'utilisation sur cette page"
				,"enabledConfortTip": "Confort d'utilisation est activé sur cette page"
			}
			// Alternative page
			,"alternative": {
				"title": "texte alternatif sur les images"
				,"back": "retour"
				,"restart": "relancer"
			}
			// Settings page
			,"settings": {
				"fontSize": "modifier la taille du texte"
				,"increaseFontSize": "augmenter"
				,"decreaseFontSize": "diminuer"
			}	
			// Help page
			,"help": {
				"shortcuts": "Touches de raccourcis:"
				,"links": "Liens"
				,"navigation": "Tab, Entr&eacute;e, Echap : navigation au clavier"
				,"showHide": "Touche '²' : afficher/masquer le menu"
				,"increaseDecreaseFontSize": "+/- : augmenter ou diminuer la taille du texte"
				,"WCAG2Link": "http://www.w3.org/Translations/WCAG20-fr/"
				,"WCAG2LinkLabel": "Règles pour l'accessibilité des contenus Web (WCAG) 2.0"
			}	
			// About page
			,"about": {
				"title": "EASE bookmarklet"				
				,"version": "version"
				,"link": "http://devteam.itn.ftgroup/spip.php?article532"
				,"page": "Lien vers la devteam"
			}			
		}

		// Alternative tool
		,"alternative": {
			"title": "alternatives - EASE bookmarklet"
			,"emptyAlternative": "attribut alt vide"
			,"noAlternative": "aucun attribut alt"
			,"validAlternative": "attribut alt renseign&eacute;"
			,"all": "tout"
			,"error": "erreur"
			,"empty": "vide"
			,"valid": "valide"
			,"errorsOn": " erreurs</span> sur "
			,"errorOn": " erreur</span> sur "
			,"image": "image"
			,"images": "images"
			,"rate": "score"
			,"highlight": "L'image a été surlignée en rouge."
			,"infoButton": "info"
			,"findButton": "voir"			
		}		

		// Screen reader tool
		,"screenReader": {
			"linkList": "Liste des liens"
			,"formList": "Liste des éléments de formulaire"
			,"headerList": "Liste des titres"
			,"iframe": "Début du cadre Fin du cadre"
			,"title": "La page contient <%=nbTitle%> titre<%(nbTitle>0)?'s':''%>, <%=nbLink%> lien<%(nbLink>0)?'s':''%>."
			,"searchSection": "Section recherche"
			,"endSearchSection": "Fin section recherche"
			,"bannerSection": "Section banni&egrave;re"
			,"endBannerSection": "Fin section banni&egrave;re"
			,"mainSection": "Section principale"
			,"endMainSection": "Fin section principale"
			,"contentInfoSection": "Section info contenu"
			,"complementarySection": "Section complémentaire"
			,"endComplementarySection": "Fin section complémentaire"
			,"articleSection": "Section article"
			,"endArticleSection": "Fin section article"
			,"endContentInfoSection": "Fin section info contenu"	
			,"navigationSection": "Section navigation"
			,"endNavigationSection": "Fin section navigation"
			,"selected": "s&eacute;lectionn&eacute;"
			,"tab": "Onglet"
			,"graphicLink": "lien graphique"
			,"titleLevel": "Titre de niveau"
		}

		// Header tag tool
		,"inspector": {
			"backButton": "Retour"						
			,"exportButton": "Export"
			,"displayOnPageTitle": "Afficher les balises HTML dans la page"
			,"displayOnPage": "HTML"
			,"all": "Tous"
			,"lang": "Attributs lang"
			,"header": "Balises de titre"
			,"inlineStyle": "Inline styles"
			,"list": "Listes"
			,"form": "Elements de formulaire"
			,"table": "Tableaux"
			,"image": "Images"			
			,"link": "Liens"
			,"role": "Roles (ARIA)"
			,"html5": "Balises HTML5"
			,"frame": "Cadres"
			,"tableDesc": "<%=numCol%> column<%(numCol>0)?'s':''%>, <%=numRow%> row<%(numRow>0)?'s':''%>"
			,"exportTitle": "EASE bookmarklet - export inspecteur"
			,"noLabel": "AUCUN LABEL"
			,"noAlt": "PAS D'ATTRIBUT ALT"
		}		

		// Auto audit
		,"autoAudit": {
			"back": "Retour"
			,"resume": "<strong><%=nbError%> erreur<%(nbError>1)?'s':''%></strong> et <strong><%=nbWarning%> avertissement<%(nbWarning>1)?'s':''%></strong> sur cette page."
			,"inlineStyleTitle": "Styles en ligne"
			,"inlineStyle": "<%=numStyle%> attribut<%(numStyle>1)?'s':''%> de style en ligne trouv&eacute;<%(numStyle>1)?'s':''%>."
			,"languageTitle": "Langue"
			,"noLanguage": "Aucun attribut de langue trouv&eacute; dans la balise HTML."
			,"languageFound": "Langue d&eacute;finie au niveau de la balise HTML : "			
			,"otherLangFound": "<%=nbLangAttr%> attribut<%(nbLangAttr>1)?'s':''%> de langue trouvé<%(nbLangAttr>1)?'s':''%> dans cette page."
			,"noOtherLangFound": "Aucun autre attribut de langue trouv&eacute; dans la page."
			,"tableTitle": "Tableaux de donn&eacute;es"
			,"tableNumber": "<%=numTable%> tableau<%numTable>1?'x':''%> trouv&eacute;<%numTable>1?'s':''%>."
			,"noTableFound": "Aucun tableau trouvé."
			,"exportButton": "Export"
			,"table": "Tableau"			
			,"general": "G&eacute;n&eacute;ral"
			,"noTitle": "Aucun titre trouv&eacute;"
			,"titleFound": "Titre de la page : "
			,"severalTitles": "Plusieurs titres de page trouv&eacute;s."
			,"keepOnlyOneTitle": "Ne garder qu'une seule balise title dans l'en tête de la page."
			,"formTitle": "Formulaires"
			,"formDescription": "<%=numForm%> formulaire<%numForm>1?'s':''%>, <%=numFieldSet%> fieldset<%numFieldSet>1?'s':''%>, <%=numLabel%> label<%numLabel>1?'s':''%>, <%=numElement%> champ<%numElement>1?'s':''%> de formulaire."
			,"imageTitle": "Images"
			,"image": "<%=numImage%> image<%numImage>1?'s':''%>, <%=numNoAlt%> sans alternative, <%=numAltValid%> avec attribut alt renseign&eacute;, <%=numEmptyAlt%> avec attribut alt vide."
			,"noImage": "Aucune image (balise img) trouv&eacute;e."
			,"frameTitle": "Cadre"
			,"frameNoTitle": "IFRAME <%num%> : <%name?name+', ':''%>pas d'attribut title valide."
			,"noFrameFound": "Aucun cadre (IFRAME) trouv&eacute;."			
			,"numFramesFound": "<%numFrames%> balise<%numFrames>1?'s':''%> IFRAME trouvée<%numFrames>1?'s':''%> (Attention: le contenu des IFRAME n'est pas audité)."	
			,"headingsTitle": "Balises de titre"
			,"noHeading": "Aucune balise de titre trouv&eacute;e (h1, h2 ... h6)."
			,"numHeadingsFound": "<%numHeadings%> balise<%numHeadings>1?'s':''%> de titre trouv&eacute;e<%numHeadings>1?'s':''%>."
			,"noH1Found": "La page ne poss&egrave;de pas de balise de titre H1."
			,"nestingError": "Erreur d'imbrication, v&eacute;rifier l'ordre des balises de titres."
			,"exportTitle": "EASE bookmarklet - export audit"
		}
});