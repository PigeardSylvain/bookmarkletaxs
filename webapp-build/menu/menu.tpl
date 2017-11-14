<!-- Header menu -->
<div>		
	<ul>
		<li id="easeBM_MenuItemFor_audit"><%=locale.menu.auditItem%></li>
		<li id="easeBM_MenuItemFor_tools"><%=locale.menu.toolsItem%></li>
		<li id="easeBM_MenuItemFor_settings"><%=locale.menu.configItem%></li>
		<li id="easeBM_MenuItemFor_help"><%=locale.menu.helpItem%></li>
		<li id="easeBM_MenuItemFor_about"><%=locale.menu.aboutItem%></li>
	</ul>
</div>

<!-- Pages -->
<div>
	<!-- audit -->
	<div id="easeBM_auditSection">
		<!-- audit main page -->
		<div id="easeBM_auditHome" class="easeBM_simplePage easeBM_page">
			<span><%=locale.menu.audit.auto%></span>
			<div>
				<button id="easeBM_auditStartButton" class="easeBM_OrangeButton"><%=locale.menu.audit.autoButton%></button>
			</div>
		</div>	

		<!-- auto audit tool page -->
		<div id="easeBM_autoAudit">
			<div class="easeBM_pageContent">				
				<div id="easeBM_autoAuditContent" class="easeBM_scrollbar" tabindex="0"></div>
				<div class="easeBM_toolbar">
					<button id="easeBM_autoAuditBackButton" class="easeBM_OrangeButton grey"><%=locale.autoAudit.back%></button>
					<button id="easeBM_autoAuditExportButton" class="easeBM_OrangeButton grey"><%=locale.autoAudit.exportButton%></button>
				</div>
			</div>
		</div>

	</div>

	<!-- Tools menu -->
	<div id="easeBM_toolsSection">

		<!-- Tools home page -->
		<div id="easeBM_toolsHome">
			<ul>
				<li><a id="easeBM_altToolLink"><%=locale.menu.tools.alternativeText%></a></li>
				<li><a id="easeBM_inspectorLink"><%=locale.menu.tools.inspector%></a></li>				
				<li><a id="easeBM_screenReaderView"><%=locale.menu.tools.screenReaderView%></a></li>				
				<li><a title="<%=locale.menu.tools.enableJqueryTip%>" id="easeBM_jqueryEnabler"><%=locale.menu.tools.enableJquery%></a></li>
				<li><a title="<%=locale.menu.tools.enableConfortTip%>" id="easeBM_confortEnabler"><%=locale.menu.tools.enableConfort%></a></li>
			</ul>
		</div>

		<!-- alternative page -->
		<div id="easeBM_toolsAlternative">						
			<div class="easeBM_pageContent">
				<!-- rate widget -->
				<div id="easeBM_altRateWidget"></div>
				<div class="easeBM_pageMessage">
					<span><%=locale.menu.alternative.title%></span>					
					<button id="easeBM_altRestartButton" class="easeBM_OrangeButton"><%=locale.menu.alternative.restart%></button>
					<button id="easeBM_altBackButton" class="easeBM_OrangeButton grey"><%=locale.menu.alternative.back%></button>
				</div>				
			</div>
		</div>

		<!-- inspector tool page -->
		<div id="easeBM_inspector"></div>

	</div>

	<!-- settings -->
	<div id="easeBM_settingsSection">
		<!-- settings page 1 -->
		<div class="easeBM_simplePage">
			<span><%=locale.menu.settings.fontSize%> (<%=fontSize%>%)</span>
			<div class="easeBM_buttons">				
				<button id="easeBM_setDownBtn" class="easeBM_OrangeButton grey"><%=locale.menu.settings.decreaseFontSize%></button>			
				<button id="easeBM_setUpBtn" class="easeBM_OrangeButton grey"><%=locale.menu.settings.increaseFontSize%></button>
			</div>
		</div>
	</div>

	<!-- help menu -->
	<div id="easeBM_helpSection">
		<!-- help page 1 -->
		<div class="easeBM_simplePage">
			<div><%=locale.menu.help.shortcuts%></div>
			    <%=locale.menu.help.navigation%><br>
			    <%=locale.menu.help.showHide%><br>
			    <%=locale.menu.help.increaseDecreaseFontSize%><br>
			
			<div><%=locale.menu.help.links%></div>
			    <a href="<%=locale.menu.help.WCAG2Link%>"><%=locale.menu.help.WCAG2LinkLabel%></a>
		</div>
	</div>

	<!-- about menu -->
	<div id="easeBM_aboutSection">
		<div class="easeBM_simplePage">
			<span><%=locale.menu.about.title%></span>
			<br><%=locale.menu.about.version%>: <%=config.version%>			
		</div>		
	</div>	
</div>
<span id="easeBM_endMenu"></span>