/*         ______________________________________
  ________|                                      |_______
  \       |           SmartAdmin WebApp          |      /
   \      |      Copyright © 2014 MyOrange       |     /
   /      |______________________________________|     \
  /__________)                                (_________\

 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * =======================================================================
 * SmartAdmin is FULLY owned and LICENSED by MYORANGE INC.
 * This script may NOT be RESOLD or REDISTRUBUTED under any
 * circumstances, and is only to be used with this purchased
 * copy of SmartAdmin Template.
 * =======================================================================
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * =======================================================================
 * original filename: app.config.js
 * filesize: ??
 * author: Sunny (@bootstraphunt)
 * email: info@myorange.ca
 * =======================================================================
 *
 * APP CONFIGURATION (HTML/AJAX/PHP Versions ONLY)
 * Description: Enable / disable certain theme features here
 * GLOBAL: Your left nav in your app will no longer fire ajax calls, set 
 * it to false for HTML version
 */	
	$.navAsAjax = true; 
/*
 * Impacts the responce rate of some of the responsive elements (lower 
 * value affects CPU but improves speed)
 */
	var throttle_delay = 350,
/*
 * The rate at which the menu expands revealing child elements on click
 */
	menu_speed = 235,
/*
 * Turn on JarvisWidget functionality
 * dependency: js/jarviswidget/jarvis.widget.min.js
 */
	enableJarvisWidgets = true,
/*
 * Warning: Enabling mobile widgets could potentially crash your webApp 
 * if you have too many widgets running at once 
 * (must have enableJarvisWidgets = true)
 */
	enableMobileWidgets = false,	
/*
 * Turn on fast click for mobile devices?
 * Enable this to activate fastclick plugin
 * dependency: js/plugin/fastclick/fastclick.js 
 */
	fastClick = false,
/*
 * These elements are ignored during DOM object deletion for ajax version 
 * It will delete all objects during page load with these exceptions:
 */
	ignore_key_elms = ["#header, #left-panel, #main, div.page-footer, #shortcut, #divSmallBoxes, #divMiniIcons, #divbigBoxes, #voiceModal, script"];
 
 
 
 
 	