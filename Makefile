#    Copyright (C) 2007 Loic Dachary (loic@dachary.org)
#    Copyright (C) 2007 Chandan Kudige (chandan@nospam.kudige.com)
#    Copyright (C) 2008 Bradley M. Kuhn <bkuhn@ebb.org>

#  This program is free software: you can redistribute it and/or modify it
#  under the terms of the GNU Affero General Public License as published
#  by the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.

#  This program is distributed in the hope that it will be useful, but
#  WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
#  Affero General Public License for more details.

#  You should have received a copy of the GNU Affero General Public
#  License along with this program in the file LICENSE.txt.  If not, see
#  <http://www.gnu.org/licenses/>.


DIST_FILES = ./ChangeLog ./LICENSE.txt ./Makefile ./README.txt ./apache-alias.conf \
	./apache.conf ./backend/resttest.php ./debian/README.Debian ./debian/changelog \
	./debian/compat ./debian/control ./debian/copyright ./debian/examples \
	./debian/rules ./feedread.html ./keycuts.html ./permalinks.html \
	./reader/cache.js ./reader/common.js ./reader/feed.js ./reader/feeddata.js \
	./reader/fsm.js ./reader/jquery.js ./reader/mockapi.js ./reader/reader.js \
	./reader/rest.html ./reader/rest.js ./reader/strings.js ./reader/template.js \
	./rest/proxy.php ./tests/jsUnitCore.js ./tests/jscoverage.js \
	 ./tests/start_uitest.html ./tests/testcases.js ./tests/testcases_common.js \
	./tests/testcases_ui.js ./tests/tlib.js ./tests/tlibui.js ./tests/uitest.patch \
	./themes/default/addfeed-added.gif ./themes/default/addfeed-bundle-bg.gif \
	./themes/default/addfeed-more-bg.gif ./themes/default/addfeed-plus.png \
	./themes/default/addfeeds-more-bg.gif ./themes/default/addfeeds-plus.png \
	./themes/default/body-bg.png ./themes/default/button-down-arrow.gif \
	./themes/default/button-left-hover.gif ./themes/default/button-left-selected.gif \
	./themes/default/button-left.gif ./themes/default/button-right-hover.gif \
	./themes/default/button-right-selected.gif ./themes/default/button-right.gif \
	./themes/default/button-up-arrow.gif ./themes/default/button.psd \
	./themes/default/card-corners-blue.gif \
	./themes/default/card-corners-current-blue.gif \
	./themes/default/card-corners-current.gif \
	./themes/default/card-corners-read-blue.gif \
	./themes/default/card-corners-read.gif ./themes/default/card-corners.gif \
	./themes/default/card-lr-current.gif ./themes/default/card-lr-read.gif \
	./themes/default/card-lr.gif ./themes/default/card-tb-blue.gif \
	./themes/default/card-tb-current-blue.gif ./themes/default/card-tb-current.gif \
	./themes/default/card-tb-read-blue.gif ./themes/default/card-tb-read.gif \
	./themes/default/card-tb.gif ./themes/default/corner-bl.gif \
	./themes/default/corner-br.gif ./themes/default/corner-tl.gif \
	./themes/default/corner-tr.gif ./themes/default/folder-minus.gif \
	./themes/default/folder-plus.gif ./themes/default/icon-addfeed.gif \
	./themes/default/icon-allitems.gif ./themes/default/icon-check.gif \
	./themes/default/icon-feed.png ./themes/default/icon-folder.gif \
	./themes/default/icon-goto-mini.gif ./themes/default/icon-goto-small.gif \
	./themes/default/icon-goto.gif ./themes/default/icon-home.gif \
	./themes/default/icon-itememail.gif ./themes/default/icon-itemread.gif \
	./themes/default/icon-itemtag.gif ./themes/default/icon-itemunread.gif \
	./themes/default/icon-nav-left.gif ./themes/default/icon-nav-right.gif \
	./themes/default/icon-overview.png ./themes/default/icon-publish.gif \
	./themes/default/icon-reading-list.gif ./themes/default/icon-rss.png \
	./themes/default/icon-share-active.png ./themes/default/icon-share-inactive.png \
	./themes/default/icon-shared.png ./themes/default/icon-star-active.png \
	./themes/default/icon-star-inactive.png ./themes/default/icon-starred.png \
	./themes/default/icon-tag.gif ./themes/default/icon-trends-selected.gif \
	./themes/default/icon-trends.gif ./themes/default/icon-unsubscribe.gif \
	./themes/default/loading.gif ./themes/default/logo.png \
	./themes/default/module-new-window-icon.gif \
	./themes/default/screenshot-share.gif ./themes/default/settings.css \
	./themes/default/settings.zip ./themes/default/theme-merged.css \
	./themes/default/theme-saved.css ./themes/default/theme.css \
	./themes/default/trends-label-corner.gif ./tools/runuitests \
	./uitest.html

all:

test:
	if [ -t 0 ] ; then \
		./tools/runuitests ; \
	fi

install: dist
	mkdir -p $(DESTDIR)/usr/share/yocto-reader
	cp -r \
		feedread.html permalinks.html reader themes \
		$(DESTDIR)/usr/share/yocto-reader
	(cd $(DESTDIR)/usr/share/yocto-reader; /bin/ln -s feedread.html index.html)
	mkdir -p $(DESTDIR)/etc/yocto-reader
	mv $(DESTDIR)/usr/share/yocto-reader/reader/mockapi.js \
		$(DESTDIR)/etc/yocto-reader
	ln -s /etc/yocto-reader/mockapi.js \
		$(DESTDIR)/usr/share/yocto-reader/reader/mockapi.js
	(VERSION=`/usr/bin/head -1 debian/changelog | /usr/bin/perl -pe 's/^\s*yocto-reader\s+\(([\d\.]+)\)\s+.*$$/$$1/'`; /bin/cp yocto-reader-$$VERSION.tar.gz $(DESTDIR)/usr/share/yocto-reader; cd $(DESTDIR)/usr/share/yocto-reader; /bin/ln -s yocto-reader-$$VERSION.tar.gz yocto-reader.tar.gz)

dist:
	@(VERSION=`/usr/bin/head -1 debian/changelog | /usr/bin/perl -pe 's/^\s*yocto-reader\s+\(([\d\.]+)\)\s+.*$$/$$1/'`; \
	/bin/rm -rf yocto-reader-$$VERSION; \
	mkdir yocto-reader-$$VERSION; \
	/bin/echo $(DIST_FILES) | /usr/bin/perl -ne 'foreach $$f (split(/\s+/)) { print "$$f\n";}' | /bin/cpio -padum yocto-reader-$$VERSION; \
	/bin/tar cf - yocto-reader-$$VERSION | /bin/gzip --best > yocto-reader-$$VERSION.tar.gz; \
	/bin/rm -rf yocto-reader-$$VERSION )

clean:
	rm -Rf tests.coverage
	(VERSION=`/usr/bin/head -1 debian/changelog | /usr/bin/perl -pe 's/^\s*yocto-reader\s+\(([\d\.]+)\)\s+.*$$/$$1/'`; /bin/rm -rf yocto-reader-$$VERSION yocto-reader-$$VERSION.tar.gz)
